using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace Spa.InfraCommon.SpaCommon.Helpers
{
    public static class DataHelper
    {
        public static List<T> DataTableToList<T>(this DataTable table) where T : class, new()
        {
            try
            {
                return table.AsEnumerable().DataTableToList<T>();
            }
            catch
            {
                return null;
            }
        }

        public static List<T> DataTableToList<T>(this IEnumerable<DataRow> rows) where T : class, new()
        {
            try
            {
                List<T> list = new List<T>();

                foreach (var row in rows)
                {
                    T obj = new T();

                    foreach (var prop in obj.GetType().GetProperties())
                    {
                        try
                        {
                            System.Reflection.PropertyInfo propertyInfo = obj.GetType().GetProperty(prop.Name);
                            if (rows.FirstOrDefault().Table.Columns.Contains(prop.Name) && propertyInfo != null && row[prop.Name] != DBNull.Value)
                            {
                                if (propertyInfo.PropertyType == typeof(Guid) || propertyInfo.PropertyType == typeof(Guid?))
                                    propertyInfo.SetValue(obj, Guid.Parse(row[prop.Name].ToString()), null);
                                else
                                    propertyInfo.SetValue(obj, Convert.ChangeType(row[prop.Name], Nullable.GetUnderlyingType(propertyInfo.PropertyType) ?? propertyInfo.PropertyType), null);
                            }
                        }
                        catch
                        {
                            continue;
                        }
                    }

                    list.Add(obj);
                }

                return list;
            }
            catch
            {
                return null;
            }
        }

        public static T ToObject<T>(this DataRow dataRow) where T : new()
        {
            T item = new T();
            foreach (DataColumn column in dataRow.Table.Columns)
            {
                System.Reflection.PropertyInfo property = item.GetType().GetProperty(column.ColumnName);

                if (dataRow.Table.Columns.Contains(column.ColumnName) && property != null && dataRow[column] != DBNull.Value)
                    property.SetValue(item, Convert.ChangeType(dataRow[column], Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType), null);
            }

            return item;
        }
    }
}