using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace gliist_server.Shared
{
    public class DateFormatter
    {
        private static readonly string pattern = "D t";
        private static readonly DateTimeFormatInfo format = new CultureInfo("en-US").DateTimeFormat;

        public static string Format(DateTime dateTime)
        {
            return dateTime.ToString(pattern, format);
        }
    }
}
