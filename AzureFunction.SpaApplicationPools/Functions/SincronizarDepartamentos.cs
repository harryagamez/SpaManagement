using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Spa.Application.SpaService;
using Spa.InfraCommon.SpaCommon.Models;

namespace AzureFunction.SpaApplicationPools.Functions
{
    public static class SincronizarDepartamentosFunction
    {
        public static string _connectionString;
        public static string _endPoint;
        public static string _apiMunicipios;

        public static ISpaService SpaService { get; set; }

#if DEBUG
        [Disable]
#endif
        [FunctionName("SincronizarDepartamentosFunction")]
        public static void Run([TimerTrigger("0 */1 * * * *")] TimerInfo myTimer, ILogger log)
        {
            try
            {
                _endPoint = Environment.GetEnvironmentVariable("ENDPOINT");
                _apiMunicipios = Environment.GetEnvironmentVariable("API_DEPARTAMENTOS");

                _connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION");
                SpaService = new SpaService(_connectionString);

                SincronizarDepartamentos(_endPoint, _apiMunicipios, log);

            }
            catch (Exception ex)
            {
                log.LogError(ex.Message);
            }
        }

        public static void SincronizarDepartamentos(string _endPoint, string _apiMunicipios, ILogger log)
        {
            using HttpClient _client = new HttpClient
            {
                BaseAddress = new Uri(_endPoint)
            };

            _client.DefaultRequestHeaders.Accept.Clear();
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage _response = _client.GetAsync(_apiMunicipios)
                .GetAwaiter()
                .GetResult();

            if (_response.IsSuccessStatusCode)
            {
                JArray _apiResponse = _response.Content.ReadAsAsync<JArray>()
                    .GetAwaiter()
                    .GetResult();

                List<DepartmentProperties> _departamentProperties = _apiResponse
                    .Select(p => new DepartmentProperties
                    {
                        Region = Convert.ToString(p["region"]),
                        CodigoDepartamento = Convert.ToInt32(p["c_digo_dane_del_departamento"]),
                        Departamento = Convert.ToString(p["departamento"]),
                        CodigoMunicipio = Convert.ToInt32(p["c_digo_dane_del_municipio"]),
                        Municipio = Convert.ToString(p["municipio"])

                    }).ToList();


                if (_departamentProperties.Any())
                    SpaService.SincronizarDepartamentos(_departamentProperties);
            }
            else
            {
                dynamic _error = JsonConvert.DeserializeObject<dynamic>(_response.Content.ReadAsStringAsync().Result);
                string _message = _error.message;
                log.LogError(_message);
            }
        }
    }
}
