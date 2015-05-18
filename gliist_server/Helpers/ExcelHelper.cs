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

        private static GuestList ReadExcel(FileStream stream, string fileName, string userId, EventDBContext db)
        {
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
            excelReader.Read();//read header

            GuestList guests = new GuestList()
            {
                title = fileName,
                userId = userId
            };

            //5. Data Reader methods
            while (excelReader.Read())
            {
                var g = new Guest()
                {

                    firstName = excelReader.FieldCount > 0 ? excelReader.GetString(0) : null,
                    lastName = excelReader.FieldCount > 1 ? excelReader.GetString(1) : null,
                    email = excelReader.FieldCount > 2 ? excelReader.GetString(2) : null,
                    phoneNumber = excelReader.FieldCount > 3 ? excelReader.GetString(3) : null,
                    plus = excelReader.FieldCount > 4 ? int.Parse(excelReader.GetString(4)) : 0,
                    userId = userId
                };

                /*var existing = db.Guests.Where(dbG => dbG.email.Equals(g.email)).FirstOrDefault();

                if (existing != null)
                {
                    g = existing;
                }*/

                guests.guests.Add(g);
            }

            //6. Free resources (IExcelDataReader is IDisposable)
            excelReader.Close();

            return guests;
        }

        public static GuestList Read(string filePath, string fileName, string userId, EventDBContext db)
        {
            FileStream stream = File.Open(filePath, FileMode.Open, FileAccess.Read);
            return ReadExcel(stream, fileName, userId, db);
        }
    }

}