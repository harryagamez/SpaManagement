using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System;
using System.Net.Http.Headers;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;
using Spa.Application.SpaService;
using Newtonsoft.Json;
using Spa.InfraCommon.SpaCommon.Models;

namespace AzureFunction.SpaApplicationPools.Functions
{
    public static class SincronizarBarrios
    {
        private static string _connectionString;
        private static string _endPoint;
        private static string _api;

        public static ISpaService SpaService { get; set; }

        [FunctionName("SincronizarBarrios")]
        public static void Run([TimerTrigger("0 */1 * * * *")]TimerInfo myTimer, ILogger log)
        {
            try
            {
                _endPoint = Environment.GetEnvironmentVariable("ENDPOINT");
                _api = Environment.GetEnvironmentVariable("API");
                _connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION");

                SpaService = new SpaService(_connectionString);

                using HttpClient _client = new HttpClient
                {
                    BaseAddress = new Uri(_endPoint)
                };

                _client.DefaultRequestHeaders.Accept.Clear();
                _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                HttpResponseMessage _response = _client.GetAsync(_api)
                    .GetAwaiter()
                    .GetResult();

                if (_response.IsSuccessStatusCode)
                {
                    JObject _json = _response.Content.ReadAsAsync<JObject>()
                        .GetAwaiter()
                        .GetResult();

                    JArray _features = (JArray)_json["features"];

                    List<Properties> _properties = _features
                        .Where(f => Convert.ToInt32(f["properties"]["SUBTIPO_BARRIOVEREDA"]) == 1)
                        .Select(f => new Properties
                        {
                            ObjectId = Convert.ToString(f["properties"]["OBJECTID"]),
                            Codigo = Convert.ToString(f["properties"]["CODIGO"]),
                            Nombre = Convert.ToString(f["properties"]["NOMBRE"]),
                            Subtipo_BarrioVereda = Convert.ToInt32(f["properties"]["SUBTIPO_BARRIOVEREDA"]),
                            ShapeArea = Convert.ToDecimal(f["properties"]["SHAPEAREA"]),
                            ShapeLen = Convert.ToDecimal(f["properties"]["SHAPELEN"])

                        }).ToList();

                    if (_properties.Any())
                        SpaService.SincronizarBarrios(_properties);
                }
                else
                {
                    dynamic _error = JsonConvert.DeserializeObject<dynamic>(_response.Content.ReadAsStringAsync().Result);
                    Console.WriteLine(_error.Message);
                }
            }
            catch (Exception ex)
            {
                log.LogError(ex.Message);
            }
        }
    }
}
