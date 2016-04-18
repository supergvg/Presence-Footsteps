﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace gliist_server.DataAccess
{
    public class GuestList
    {
        [JsonIgnore]
        public virtual Company company { get; set; }

        public int id { get; set; }

        public string listType { get; set; }

        public string title { get; set; }

        public virtual List<Guest> guests { get; set; }
        public string promoter_Id { get; set; }

        public DateTime created_on { get; set; }

        public virtual UserModel created_by { get; set; }

        [JsonIgnore]
        public bool isDeleted { get; set; }

        [NotMapped]
        public bool CreateCopy { get; set; }

        public GuestList()
        {
            guests = new List<Guest>();
            created_on = DateTime.Now;
        }
    }
}