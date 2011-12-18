import logging

from socorro.middleware.service import DataAPIService

logger = logging.getLogger("webapi")


class Topcrasher_Versions(DataAPIService):

    """
    Topcrasher Versions entry point.
    """

    service_name = "topcrasher_versions"
    uri = "/topcrasher_versions/(.*)/"

    def __init__(self, config):
        super(Topcrasher_Versions, self).__init__(config)
        logger.debug("Topcrasher_Versions service __init__")

    def get(self, *args):
        """
        Fetch all versions related to a crash signature for a specific product
        """
        params = dict(zip(['versions','signatures']))
        logger.debug(params)

        module = self.get_module(params)
        impl = module.Topcrasher_Versions(config=self.context)
        return impl.get(**params)
