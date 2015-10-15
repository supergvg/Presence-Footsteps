namespace gliist_server.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class FacebookInstagrammTwitter_Fields : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Companies", "FacebookPageUrl", c => c.String());
            AddColumn("dbo.Companies", "InstagrammPageUrl", c => c.String());
            AddColumn("dbo.Companies", "TwitterPageUrl", c => c.String());
            AddColumn("dbo.Events", "FacebookPageUrl", c => c.String());
            AddColumn("dbo.Events", "InstagrammPageUrl", c => c.String());
            AddColumn("dbo.Events", "TwitterPageUrl", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Events", "TwitterPageUrl");
            DropColumn("dbo.Events", "InstagrammPageUrl");
            DropColumn("dbo.Events", "FacebookPageUrl");
            DropColumn("dbo.Companies", "TwitterPageUrl");
            DropColumn("dbo.Companies", "InstagrammPageUrl");
            DropColumn("dbo.Companies", "FacebookPageUrl");
        }
    }
}
