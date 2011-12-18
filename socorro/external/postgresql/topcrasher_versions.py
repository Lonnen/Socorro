import logging

from socorro.external.postgresql.base import PostgreSQLBase

logger = logging.getLogger("webapi")

class Topcrasher_Versions(PostgreSQLBase):
    def __init__(self, *args, **kwargs):
        super(Topcrasher_Versions, self).__init__(*args, **kwargs)
        logger.debug("Topcrasher_Versions postgres")

    def get(versions, signatures):
        sql = """
            /* Topcrasher_Versions */
            SELECT DISTINCT
                sd.signature,
                array_to_string(array_agg(pd.version ORDER BY pd.sort_key DESC),', ') as versions,
                min(sd.first_report) as first_report
            FROM
                signature_productdims sd
            INNER JOIN
                productdims pd ON sd.productdims_id = pd.id
            WHERE
                sd.signature IN '%s'
                AND pd.product = '%s'
            GROUP BY sd.signature
            """
        logger.debug(cursor.mogrify(sql, signatures, versions)
        cursor.execute(sql, args)

        return cursor.fetchall()
