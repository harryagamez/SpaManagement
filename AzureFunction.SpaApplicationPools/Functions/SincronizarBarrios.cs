using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System;
using System.Net.Http.Headers;
using Newtonsoft.Json.Linq;
using AzureFunction.SpaApplicationPools.Entities;
using System.Collections.Generic;
using System.Linq;
using Spa.Application.SpaService;

namespace AzureFunction.SpaApplicationPools.Functions
{
    public static class SincronizarBarrios
    {
        private static string _connectionString;
        private static string _endPoint;

        public static ISpaService SpaService { get; set; }

        [FunctionName("SincronizarBarrios")]
        public static void Run([TimerTrigger("0 */1 * * * *")]TimerInfo myTimer, ILogger log)
        {
            try
            {
                _endPoint = Environment.GetEnvironmentVariable("ENDPOINT_ARCGIS");
                _connectionString = Environment.GetEnvironmentVariable("DBConnection");

                SpaService = new SpaService(_connectionString);

                using HttpClient client = new HttpClient
                {
                    BaseAddress = new Uri(_endPoint)
                };

                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                HttpResponseMessage responde = client.GetAsync("datasets/c844f0fd764f41b2a808d8747457de8a_4.geojson")
                    .GetAwaiter()
                    .GetResult();

                if (responde.IsSuccessStatusCode)
                {
                    JObject json = responde.Content.ReadAsAsync<JObject>()
                        .GetAwaiter()
                        .GetResult();

                    JArray features = (JArray)json["features"];

                    List<Properties> _properties = features
                        .Where(x => Convert.ToInt32(x["properties"]["SUBTIPO_BARRIOVEREDA"]) == 1)
                        .Select(p => new Properties
                        {
                            ObjectId = Convert.ToString(p["properties"]["OBJECTID"]),
                            Codigo = Convert.ToString(p["properties"]["CODIGO"]),
                            Nombre = Convert.ToString(p["properties"]["NOMBRE"]),
                            Subtipo_BarrioVereda = Convert.ToInt32(p["properties"]["SUBTIPO_BARRIOVEREDA"]),
                            ShapeArea = Convert.ToDecimal(p["properties"]["SHAPEAREA"]),
                            ShapeLen = Convert.ToDecimal(p["properties"]["SHAPELEN"])

                        }).ToList();
                }
            }
            catch (Exception ex)
            {
                log.LogError(ex.Message);
            }
        }
    }
}
