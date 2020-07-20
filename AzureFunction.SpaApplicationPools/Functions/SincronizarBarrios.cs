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
        public static string _connectionString;
        public static string _endPointMed;
        public static string _apiMed;
        public static string _endPoint;
        public static string _apiEnv;
        public static string _apiIta;

        public static ISpaService SpaService { get; set; }

        [FunctionName("SincronizarBarrios")]
        public static void Run([TimerTrigger("0 */1 * * * *")]TimerInfo myTimer, ILogger log)
        {
            try
            {

                _endPointMed = Environment.GetEnvironmentVariable("ENDPOINT_MED");
                _apiMed = Environment.GetEnvironmentVariable("API_MED");

                _endPoint = Environment.GetEnvironmentVariable("ENDPOINT");
                _apiEnv = Environment.GetEnvironmentVariable("API_ENV");
                _apiIta = Environment.GetEnvironmentVariable("API_ITA");

                _connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION");
                SpaService = new SpaService(_connectionString);

                SincronizarBarriosMedellin(_endPointMed, _apiMed, "MEDELLIN");
                SincronizarBarriosEnvigado(_endPoint, _apiEnv, "ENVIGADO");
                SincronizarBarriosItagui(_endPoint, _apiIta, "ITAGUI");

            }
            catch (Exception ex)
            {
                log.LogError(ex.Message);
            }
        }

        public static void SincronizarBarriosMedellin(string endpoint, string api, string municipio)
        {
            try
            {
                using HttpClient _client = new HttpClient
                {
                    BaseAddress = new Uri(endpoint)
                };

                _client.DefaultRequestHeaders.Accept.Clear();
                _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                HttpResponseMessage _response = _client.GetAsync(api)
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
                        SpaService.SincronizarBarrios(_properties, municipio);
                }
                else
                {
                    dynamic _error = JsonConvert.DeserializeObject<dynamic>(_response.Content.ReadAsStringAsync().Result);
                    Console.WriteLine(_error.Message);
                }
            }
            catch
            {
                throw;
            }
        }

        public static void SincronizarBarriosEnvigado(string endpoint, string api, string municipio)
        {
            try
            {
                using HttpClient _client = new HttpClient
                {
                    BaseAddress = new Uri(endpoint)
                };

                _client.DefaultRequestHeaders.Accept.Clear();
                _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                HttpResponseMessage _response = _client.GetAsync(api)
                    .GetAwaiter()
                    .GetResult();

                if (_response.IsSuccessStatusCode)
                {
                    JArray _json = _response.Content.ReadAsAsync<JArray>()
                        .GetAwaiter()
                        .GetResult();

                    List<Properties> _properties = _json
                        .Select(p => new Properties
                        {
                            ObjectId = Convert.ToString(p["objectid"]),
                            Codigo = Convert.ToString(p["barrio"]),
                            Nombre = Convert.ToString(p["nombarrio"]),
                            Subtipo_BarrioVereda = 1,
                            ShapeArea = Convert.ToDecimal(p["shape_leng"]),
                            ShapeLen = Convert.ToDecimal(p["shape_area"])

                        }).ToList();

                    if (_properties.Any())
                        SpaService.SincronizarBarrios(_properties, municipio);
                }
                else
                {
                    dynamic _error = JsonConvert.DeserializeObject<dynamic>(_response.Content.ReadAsStringAsync().Result);
                    Console.WriteLine(_error.Message);
                }
            }
            catch
            {
                throw;
            }
        }

        public static void SincronizarBarriosItagui(string endpoint, string api, string municipio)
        {
            try
            {
                using HttpClient _client = new HttpClient
                {
                    BaseAddress = new Uri(endpoint)
                };

                _client.DefaultRequestHeaders.Accept.Clear();
                _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                HttpResponseMessage _response = _client.GetAsync(api)
                    .GetAwaiter()
                    .GetResult();

                if (_response.IsSuccessStatusCode)
                {
                    JArray _json = _response.Content.ReadAsAsync<JArray>()
                        .GetAwaiter()
                        .GetResult();

                    List<Properties> _properties = _json
                     .Select(p => new Properties
                     {
                         ObjectId = Convert.ToString(p["pk_barrio"]),
                         Codigo = Convert.ToString(p["barrio"]),
                         Nombre = Convert.ToString(p["nom_barrio"]),
                         Subtipo_BarrioVereda = 1

                     }).ToList();

                    if (_properties.Any())
                        SpaService.SincronizarBarrios(_properties, municipio);
                }
                else
                {
                    dynamic _error = JsonConvert.DeserializeObject<dynamic>(_response.Content.ReadAsStringAsync().Result);
                    Console.WriteLine(_error.Message);
                }
            }
            catch
            {
                throw;
            }
        }
    }
}
