using System;
using gliist_server.DataAccess;

namespace gliist_server.Models
{
    static class HardcodedConditions
    {
        public static bool IsCompanyPopsugar(Company company)
        {
            if (company == null)
                return false;

            return string.Compare(company.name, "popsugar", StringComparison.OrdinalIgnoreCase) == 0;
        }
    }
}