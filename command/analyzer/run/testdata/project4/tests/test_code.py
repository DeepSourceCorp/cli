import unittest
from demo_code import RandomNumberGenerator


def test_random_number_generator():
    """Test random number generator."""
    assert RandomNumberGenerator().get_number()

class Tests(unittest.TestCase):
    def my_test(self, arg1, arg2):
        self.assertEquals(arg1, arg2)
