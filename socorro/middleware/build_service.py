import logging

from socorro.middleware.service import DataAPIService

logger = logging.getLogger("webapi")


class Build(DataAPIService):

    service_name = "build"
    uri = "/reports/build/p/(.*)/v/(.*)/start/(.*)/end/(.*)/"

    def __init__(self, config):
        super(Build, self).__init__(config)
        logger.debug("Build service __init__")

    def get(self, *args):
        """
        Fetch crash counts aggregated on build date.
        """
        params = dict(zip(['product', 'version', 'start', 'end'], args))
        logger.debug(params)

        module = self.get_module(params)
        impl = module.Build(config=self.context)

        return impl.crashes_by_build(**params)

