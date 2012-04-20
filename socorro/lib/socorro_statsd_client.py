from statsd import StatsClient


def make_stats_client(context):
    '''Create a new client for statsD using the following values in the
    context object:

        statsdHost         the host address of the statsd server, name or ip
        statsdPort         the server port to talk to, default 8125
        statsdPrefix       string for namespacing statistics
    '''
    return StatsClient(host=context.statsdHost,
                       port=context.statsdPort,
                       prefix=context.statsdPrefix)
