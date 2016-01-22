using System.Data.Entity.Migrations;

namespace gliist_server.Migrations
{
    public partial class TicketType_Drop : DbMigration
    {
        public override void Up()
        {
            Sql(" IF (EXISTS (SELECT * " +
                " FROM INFORMATION_SCHEMA.TABLES " +
                " WHERE TABLE_SCHEMA = 'TheSchema' " +
                " AND  TABLE_NAME = 'TicketTypes'))" +
                " BEGIN " +
                "  DROP TABLE [dbo].[TicketTypes];" +
                " END");

        }

        public override void Down()
        {
        }
    }
}
