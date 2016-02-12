namespace gliist_server.Areas.Ticketing.Models
{
    public interface ISellingFacade
    {
        int GetSoldTicketsNumber(int ticketTierId);
    }
}