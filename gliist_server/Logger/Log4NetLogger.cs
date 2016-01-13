using System;
using System.Collections.Generic;
using log4net;

namespace gliist_server.Logger
{
    public static class Log4NetLogger
    {
        private static readonly IDictionary<LogLevel, LogMethod> _methods;
        private delegate void LogMethod(ILog loggger, object message, Exception exception);

        /// <summary>
        /// Initializes a new instance of the <see cref="Log4NetLogger"/> class.
        /// </summary>
        static Log4NetLogger()
        {
            _methods = new Dictionary<LogLevel, LogMethod>
                               {
                                   { LogLevel.Debug, (log, msg, ex) => log.Debug(msg, ex) },
                                   { LogLevel.Info, (log, msg, ex) => log.Info(msg, ex) },
                                   { LogLevel.Warning, (log, msg, ex) => log.Warn(msg, ex) },
                                   { LogLevel.Error, (log, msg, ex) => log.Error(msg, ex) },
                                   { LogLevel.Fatal, (log, msg, ex) => log.Fatal(msg, ex) },
                               };

            log4net.Config.XmlConfigurator.Configure();
        }

        /// <summary>
        /// Logs the specified message.
        /// </summary>
        /// <param name="message">The message.</param>
        /// <param name="exception">The exception.</param>
        /// <param name="level">The level.</param>
        /// <param name="context">The context (custom details).</param>
        public static void Log(object message = null, Exception exception = null, LogLevel level = LogLevel.Info, string context = null)
        {
            if (exception != null)
            {
                level = level < LogLevel.Error ? LogLevel.Error : level;
                message = message ?? "Unhandled exeption";
            }

            var logger = LogManager.GetLogger("Default");
            _methods[level](logger, message, exception);
        }

        /// <summary>
        /// Logs the error.
        /// </summary>
        /// <param name="exception">The exception.</param>
        /// <param name="message">The message.</param>
        /// <param name="context">The context (custom details).</param>
        public static void LogError(Exception exception, string message = null, string context = null)
        {
            Log(message, exception, LogLevel.Error, context);
        }

        /// <summary>
        /// Logs the information.
        /// </summary>
        /// <param name="messageTemplate">The message template.</param>
        /// <param name="messageArgs">The message arguments.</param>
        public static void LogInfo(string messageTemplate, params object[] messageArgs)
        {
            Log(string.Format(messageTemplate, messageArgs));
        }
    }
}