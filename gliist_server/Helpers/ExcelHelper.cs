using Excel;
using gliist_server.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Web;

namespace gliist_server.Helpers
{
    public static class ExcelHelper
    {

        private static GuestList ReadExcel(FileStream stream, string fileName, UserModel user, Company comapny, EventDBContext db, GuestList gl)
        {

            GuestList retVal;
            if (gl != null)
            {
                retVal = gl;
                db.Entry(gl).State = System.Data.Entity.EntityState.Modified;
            }
            else
            {
                retVal = new GuestList()
                {
                    title = fileName,
                    company = comapny,
                    created_by = user,
                    listType = "GA",
                    guests = new List<Guest>()
                };
            }

            //2. Reading from a OpenXml Excel file (2007 format; *.xlsx)
            IExcelDataReader excelReader;

            if (Path.GetExtension(fileName) == ".xlsx")
            {
                excelReader = ExcelReaderFactory.CreateOpenXmlReader(stream);
            }
            else
            {
                excelReader = ExcelReaderFactory.CreateBinaryReader(stream);
            }

            //4. DataSet - Create column names from first row
            DataSet result = excelReader.AsDataSet();

            if (result.Tables.Count > 0)
            {

                for (int i = 1; i < result.Tables[0].Rows.Count; i++)
                {
                    var rowI = result.Tables[0].Rows[i];
                    var itemArr = rowI.ItemArray;
                    var count = itemArr.Count();

                    try
                    {
                        var g = new Guest()
                        {

                            firstName = count > 0 ? itemArr[0].ToString() : null,
                            lastName = count > 1 ? itemArr[1].ToString() : null,
                            email = count > 2 ? itemArr[2].ToString() : null,
                            phoneNumber = count > 3 ? itemArr[3].ToString() : null,
                            plus = count > 4 ? int.Parse(itemArr[4].ToString()) : 0,
                            company = comapny
                        };

                        retVal.guests.Add(g);
                    }
                    catch
                    {

                    }
                }
            }
            else
            {
                excelReader.Read();//read header

                //5. Data Reader methods
                while (excelReader.Read())
                {
                    try
                    {
                        var g = new Guest()
                        {

                            firstName = excelReader.FieldCount > 0 ? excelReader.GetString(0) : null,
                            lastName = excelReader.FieldCount > 1 ? excelReader.GetString(1) : null,
                            email = excelReader.FieldCount > 2 ? excelReader.GetString(2) : null,
                            phoneNumber = excelReader.FieldCount > 3 ? excelReader.GetString(3) : null,
                            plus = excelReader.FieldCount > 4 ? int.Parse(excelReader.GetString(4)) : 0,
                            company = comapny
                        };

                        retVal.guests.Add(g);
                    }
                    catch
                    {

                    }
                }
            }

            //6. Free resources (IExcelDataReader is IDisposable)
            excelReader.Close();

            return retVal;
        }

        public static GuestList Read(string filePath, string fileName, UserModel user, Company company, EventDBContext db, GuestList gl)
        {
            FileStream stream = File.Open(filePath, FileMode.Open, FileAccess.Read);
            return ReadExcel(stream, fileName, user, company, db, gl);
        }
    }

}