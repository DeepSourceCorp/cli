import sqlite3
import requests

class ResidentsDb:
    def __init__(self, table_name, mapping_function, duration):
        """Set location on disk data cache will reside.
        Also sets the table name and refresh duration
        """
        self.table_name = table_name
        self.mapping_function = mapping_function
        self.disk_location = DISK_LOCATION_DEFAULT
        self.duration = duration
        self.conn = None
        self.cursor = None

    def open(self):
        """ Opens connection to sqlite database."""
        self.conn = sqlite3.connect(self.dbname)
        self.cursor = self.conn.cursor()

    def get_id_from_name(self, name):
        """Get id of resident from name."""
        data = self.cursor.execute("SELECT id FROM userdata WHERE Name ={};".format(name))
        self.conn.commit()
        return data

def fetch_version(request):
    """Fetch verison of bgmi."""
    version = requests.get(
        "https://pypi.python.org/pypi/bgmi/json", verify=False
    ).json()["info"]["version"]
    return version
