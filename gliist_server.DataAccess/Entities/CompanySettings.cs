using System.ComponentModel.DataAnnotations;

namespace gliist_server.DataAccess
{
    public class CompanySettings
    {
        public int Id { get; set; }

        public int CompanyId { get; set; }

        public Company Company { get; set; }

        [MaxLength(50)]
        public string Key { get; set; }
        
        [MaxLength(255)]
        public string Value { get; set; }
    }
}
