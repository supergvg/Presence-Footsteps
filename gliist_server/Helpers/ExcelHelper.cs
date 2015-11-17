using Excel;
using gliist_server.Models;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using OfficeOpenXml;
using OfficeOpenXml.Style;

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

        public static byte[] CreateGuestsListsExcelFile(List<GuestListInstance> guestLists)
        {
            byte[] bytes = null;

            using (var excel = new ExcelPackage())
            {
                excel.Workbook.Worksheets.Add("Pending");
                excel.Workbook.Worksheets.Add("Checked");

                var pendingWorksheet = excel.Workbook.Worksheets[1];
                pendingWorksheet.Cells[1, 1, 1, 6].Style.Font.Bold = true;
                pendingWorksheet.Cells[1, 1, 1, 6].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                pendingWorksheet.Cells[1, 1].Value = "First Name";
                pendingWorksheet.Cells[1, 2].Value = "Last Name";
                pendingWorksheet.Cells[1, 3].Value = "Email";
                pendingWorksheet.Cells[1, 4].Value = "Type";
                pendingWorksheet.Cells[1, 5].Value = "Phone Number";
                pendingWorksheet.Cells[1, 6].Value = "Plus";

                var chackedWorksheet = excel.Workbook.Worksheets[2];
                chackedWorksheet.Cells[1, 1, 1, 6].Style.Font.Bold = true;
                chackedWorksheet.Cells[1, 1, 1, 6].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;



                chackedWorksheet.Cells[1, 1].Value = "First Name";
                chackedWorksheet.Cells[1, 2].Value = "Last Name";
                chackedWorksheet.Cells[1, 3].Value = "Email";
                chackedWorksheet.Cells[1, 4].Value = "Type";
                chackedWorksheet.Cells[1, 5].Value = "Phone Number";
                chackedWorksheet.Cells[1, 6].Value = "Plus";


                if (guestLists != null)
                {
                    var guestCheckins = guestLists.SelectMany(x => x.actual).ToList();
                    var pendingGuests = guestCheckins.Where(x => x.status == "no show");
                    var checkedguests = guestCheckins.Where(x => x.status == "checked in");

                    int i = 2;
                    foreach (var guestCheckin in pendingGuests)
                    {
                        var guest = guestCheckin.guest;
                        if (guest != null)
                        {
                            chackedWorksheet.Cells[i, 1, i, 6].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                            pendingWorksheet.Cells[i, 1].Value = guest.firstName;
                            pendingWorksheet.Cells[i, 2].Value = guest.lastName;
                            pendingWorksheet.Cells[i, 3].Value = guest.email;
                            pendingWorksheet.Cells[i, 4].Value = guest.type;
                            pendingWorksheet.Cells[i, 5].Value = guest.phoneNumber;
                            pendingWorksheet.Cells[i, 6].Value = guest.plus;
                        }
                        i++;
                    }

                    i = 2;
                    foreach (var guestCheckin in checkedguests)
                    {
                        var guest = guestCheckin.guest;
                        if (guest != null)
                        {
                            chackedWorksheet.Cells[i, 1, i, 6].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                            chackedWorksheet.Cells[i, 1].Value = guest.firstName;
                            chackedWorksheet.Cells[i, 2].Value = guest.lastName;
                            chackedWorksheet.Cells[i, 3].Value = guest.email;
                            chackedWorksheet.Cells[i, 4].Value = guest.type;
                            chackedWorksheet.Cells[i, 5].Value = guest.phoneNumber;
                            chackedWorksheet.Cells[i, 6].Value = guest.plus;
                        }
                        i++;
                    }
                }

                pendingWorksheet.Column(1).Width = 30;
                pendingWorksheet.Column(2).Width = 30;
                pendingWorksheet.Column(3).Width = 40;
                pendingWorksheet.Column(4).Width = 10;
                pendingWorksheet.Column(5).Width = 30;
                pendingWorksheet.Column(6).Width = 10;

                chackedWorksheet.Column(1).Width = 30;
                chackedWorksheet.Column(2).Width = 30;
                chackedWorksheet.Column(3).Width = 40;
                chackedWorksheet.Column(4).Width = 10;
                chackedWorksheet.Column(5).Width = 30;
                chackedWorksheet.Column(6).Width = 10;

                bytes = excel.GetAsByteArray();
            }

            return bytes;
        }
    }
    }

}