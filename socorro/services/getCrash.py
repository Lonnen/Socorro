import datetime as dt
import urllib2 as u2
import logging
logger = logging.getLogger("webapi")

import socorro.lib.util as util
import socorro.webapi.webapiService as webapi
import socorro.database.database as db
import socorro.lib.datetimeutil as dtutil
import socorro.storage.crashstorage as cs
import web

import socorro.services.schedulePriorityJob as job

datatype_options = ('meta', 'raw_crash', 'processed')
crashStorageFunctions = ('fetchMeta', 'fetchRaw', 'fetchProcessed')
datatype_function_associations = dict(zip(datatype_options, crashStorageFunctions))

class NotADataTypeOption(Exception):
  def __init__(self, reason):
    #super(NotADataTypeOption, self).__init__("%s must be one of %s" % (reason, ','.join(datatype_options))
    Exception.__init__("%s must be one of %s" % (reason, ','.join(datatype_options)))

def dataTypeOptions(x):
  if x in datatype_options:
    return x
  raise NotADataTypeOption(x)

#=================================================================================================================
class GetCrash(webapi.JsonServiceBase):
  #-----------------------------------------------------------------------------------------------------------------
  def __init__(self, configContext):
    super(GetCrash, self).__init__(configContext)
    logger.debug('GetCrash __init__')
  #-----------------------------------------------------------------------------------------------------------------
  uri = '/201005/crash/(.*)/by/uuid/(.*)'
  #-----------------------------------------------------------------------------------------------------------------
  def get(self, *args):
    convertedArgs = webapi.typeConversion([dataTypeOptions,str], args)
    parameters = util.DotDict(zip(['datatype','uuid'], convertedArgs))
    logger.debug("GetCrash get %s", parameters)
    self.crashStorage = self.crashStoragePool.crashStorage()
    function_name = datatype_function_associations[parameters.datatype]
    function = self.__getattribute__(function_name)
    return function(parameters.uuid)    

  def fetchProcessed(self, uuid):
    try:
        return self.crashStorage.get_processed(uuid)
    except Exception:
        try:
            raw = self.fetchRaw(uuid)
            j = job.schedulePriorityJob(self.context)
            j.post(uuid)
        except Exception:
            raise web.webapi.NotFound()
        raise webapi.Timeout()

  def fetchMeta(self, uuid):
    return self.crashStorage.get_meta(uuid)

  def fetchRaw(self, uuid):
    return (self.crashStorage.get_raw_dump(uuid), "application/octet-stream")
