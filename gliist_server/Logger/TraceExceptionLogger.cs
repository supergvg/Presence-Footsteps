using System.Diagnostics;
using System.Web.Http.ExceptionHandling;

namespace gliist_server.Logger
{
    public class TraceExceptionLogger : ExceptionLogger
    {
        public override void Log(ExceptionLoggerContext context)
        {
            Log4NetLogger.LogError(context.ExceptionContext.Exception);
            Trace.TraceError(context.ExceptionContext.Exception.ToString());
        }
    }
}
