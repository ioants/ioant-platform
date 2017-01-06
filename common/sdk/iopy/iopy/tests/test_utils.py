import unittest
from pynab.utils import utils


class UtilsTestCase(unittest.TestCase):
    """Tests for `utils.py`."""

    def test_topic_to_dict_valid(self):
        """Is five successfully determined to be prime?"""
        valid_test_topic = 'live/kil/runneval/tempy/0/1'
        result = utils.topic_to_dict(valid_test_topic)
        self.assertEqual(result['global'], 'kil')
        self.assertEqual(result['local'], 'runneval')
        self.assertEqual(result['message_type'], 0)
        self.assertEqual(result['stream_index'], 1)

    def test_topic_to_dict_missing(self):
        """topic missing stream index"""
        invalid_test_topic = 'live/kil/runneval/tempy/0'
        result = utils.topic_to_dict(invalid_test_topic)
        self.assertIsNone(result)
