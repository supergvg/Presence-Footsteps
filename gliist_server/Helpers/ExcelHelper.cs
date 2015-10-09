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
                    listType = gl != null ? gl.listType : "GA",
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
                for (int i = 0; i < result.Tables[0].Rows.Count; i++)
                {
                    var rowI = result.Tables[0].Rows[i];
                    var itemArr = rowI.ItemArray;
                    var count = itemArr.Count();

                    try
                    {
                        var s = itemArr[0].ToString().Split(' ');

                        string firstName = count > 0 ? itemArr[0].ToString() : null,
                            lastName = count > 1 ? itemArr[1].ToString() : null;

                        if (s.Length > 1 && (count > 1 && string.IsNullOrEmpty(lastName)))
                        {
                            firstName = s[0];
                            //first column has 2 words and 2nd is empty
                            lastName = s[1];
                        }

                        var pluses = 0;

                        if (itemArr.Length > 4)
                        {
                            if (!int.TryParse(itemArr[4].ToString(), out pluses))
                            {
                                pluses = 0;
                            }
                        }

                        var g = new Guest()
                       {

                           firstName = firstName,
                           lastName = lastName,
                           email = count > 2 ? itemArr[2].ToString() : null,
                           phoneNumber = count > 3 ? itemArr[3].ToString() : null,
                           plus = pluses,
                           company = comapny,


                           type = retVal.listType
                       };

                        if (string.IsNullOrEmpty(g.firstName))
                        {
                            continue;
                        }
                        if (string.IsNullOrEmpty(g.lastName))
                        {
                            g.lastName = "Guest";
                        }

                        retVal.guests.Add(g);
                    }
                    catch
                    {

                    }
                }
            }
            else
            {
                //5. Data Reader methods
                while (excelReader.Read())
                {
                    try
                    {

                        var s = excelReader.GetString(0).Split(' ');

                        string firstName = excelReader.FieldCount > 0 ? excelReader.GetString(0) : null,
                          lastName = excelReader.FieldCount > 1 ? excelReader.GetString(1) : null;

                        if (s.Length > 1 && (excelReader.FieldCount > 1 && string.IsNullOrEmpty(lastName)))
                        {
                            firstName = s[0];
                            //first column has 2 words and 2nd is empty
                            lastName = s[1];
                        }


                        var pluses = 0;

                        if (excelReader.FieldCount > 4)
                        {
                            if (!int.TryParse(excelReader.GetString(4), out pluses))
                            {
                                pluses = 0;
                            }
                        }


                        var g = new Guest()
                        {

                            firstName = firstName,
                            lastName = lastName,
                            email = excelReader.FieldCount > 2 ? excelReader.GetString(2) : null,
                            phoneNumber = excelReader.FieldCount > 3 ? excelReader.GetString(3) : null,
                            plus = pluses,
                            company = comapny,

                            type = retVal.listType
                        };

                        if (string.IsNullOrEmpty(g.firstName))
                        {
                            continue;
                        }
                        if (string.IsNullOrEmpty(g.lastName))
                        {
                            g.lastName = "Guest";
                        }

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