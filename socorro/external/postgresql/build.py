import logging

from socorro.external.postgresql.base import PostgreSQLBase

logger = logging.getLogger("webapi")

class Build(PostgreSQLBase):
    """
    Implements the build report service with PostgreSQL
    """

    def __init__(self, *args, **kwargs):
        super(Build, self).__init__(*args, **kwargs)
        logger.debug("Build postgres")

    def crashes_by_build(self, **kwargs):
        """
        Root through the database and return crash counts aggregated on build
        date.
        """ 
        parameters = kwargs
        cursor = self.database.connection().cursor()
 
        crashes_by_build_sql = """
             /* socorro.services.Build */
             SELECT 
                 build_date,
                 sum(crash_count)::BIGINT as count
             FROM crashes_by_build
             JOIN product_info pi using (product_version_id)
             WHERE pi.product_name = %(product)s
             AND pi.version_string = %(version)s
             AND report_date >= utc_day_begins_pacific((%(start)s)::date)
             AND report_date <= utc_day_begins_pacific((%(end)s)::date)
             GROUP BY
                 build_date
             ORDER BY
                 1"""

        logger.debug(cursor.mogrify(crashes_by_build_sql, parameters))
        cursor.execute(crashes_by_build_sql, parameters)

        result = []
        total = 0
        for build_date, count in cursor.fetchall():
            result.append({'build_date': str(build_date),
                           'count': count})
            total += count
        return ({'build': result, 'startDate': str(parameters['start']),
                'endDate': str(parameters['end']), 'totalCount': count},
                "application/json")
