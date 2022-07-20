from scripts.postprocess_result import (
	sequence_dict_from_df,
	sort_dict_by_keys,
	get_amp_region_index,
	get_amp_subsequences,
	get_probability_profile
)

import unittest
import pandas as pd
from io import StringIO
from textwrap import dedent

# Sample dataframe
sample_string = dedent(
	"""
	seqID,level,Probability,Length,Sequence,HMM,isAMP
	A,0,0.5006428571428571,10,MVRCCRSLHS,0,True
	B,0,0.8043192640692641,10,MRRLGLVMLV,1,True
	B,1,0.7043192640692641,9,LVMLVLLLL,1,True
	C,0,0.1291904761904762,10,MQDRQHYFMI,1,False
	C,1,0.2291904761904762,10,HYFMIAFTWF,1,False
	C,2,0.7291904761904762,10,AFTWFLVFLV,1,True
	C,3,0.8291904761904762,10,LVFLVLGPQA,1,True
	D,0,0.23176785714285722,10,APVNDGTEAD,0,False
	D,1,0.03176785714285722,10,GTEADNDERA,0,False
	D,2,0.53176785714285722,10,NDERAASLLV,0,True
	D,3,0.73176785714285722,10,ASLLVHLKGD,0,True
	D,4,0.03176785714285722,10,HLKGDKDGGG,0,False
	D,5,0.03176785714285722,10,KDGGGLTGSP,0,False
	D,6,0.78176785714285722,10,LTGSPDGVSA,0,True
	D,7,0.93176785714285722,10,DGVSAGTTDG,0,True
	D,8,0.13176785714285722,10,GTTDGTDSSK,0,False
	D,9,0.33176785714285722,10,TDSSKELAGG,0,False
	E,0,0.53176785714285722,10,APVNDGTEAD,0,True
	E,1,0.73176785714285722,10,GTEADNDERA,0,True
	E,2,0.03176785714285722,10,NDERAASLLV,0,False
	E,3,0.13176785714285722,10,ASLLVHLKGD,0,False
	E,4,0.63176785714285722,10,HLKGDKDGGG,0,True
	E,5,0.73176785714285722,10,KDGGGLTGSP,0,True
	E,6,0.38176785714285722,10,LTGSPDGVSA,0,False
	E,7,0.43176785714285722,10,DGVSAGTTDG,0,False
	E,8,0.83176785714285722,10,GTTDGTDSSK,0,True
	E,9,0.93176785714285722,10,TDSSKELAGG,0,True
	F,0,0.1006428571428571,10,MVRCCRSLHS,0,False
	F,1,0.2291904761904762,10,RSLHSAFTWF,0,False
	"""
)

class SortDictByKeysTest(unittest.TestCase):
	def test_proper_sort(self):
		d = {
			('a', 3): 1,
			('b', 2): 1,
			('a', 1): 1,
			('a', 2): 1,
			('b', 1): 1,
			('c', 5): 1,
			('c', 2): 1
		}

		expected_keys = [('a', 1), ('a', 2), ('a', 3), ('b', 1), ('b', 2), 
			('c', 2), ('c', 5)]

		observed_keys = sort_dict_by_keys(d)

		self.assertEqual(expected_keys, observed_keys)

class SequenceDictFromDfTest(unittest.TestCase):
	def setUp(self):
		# Parameters
		self.window_size = 10
		self.step_len = 5

		mock_data = StringIO(sample_string)
		test_df = pd.read_csv(mock_data).set_index(['seqID', 'level'])
		self.test_df = test_df

		# Empty dataframe
		self.empty_df = pd.DataFrame()

	def test_empty_df(self):
		d = self.empty_df.to_dict(orient='index')

		obs_seq_dict, obs_chunked_amp_dict = sequence_dict_from_df(d,
																													self.window_size,
																													self.step_len)

		exp_seq_dict = {}
		exp_chunked_amp_dict = {}

		self.assertEqual(exp_seq_dict, obs_seq_dict)
		self.assertEqual(exp_chunked_amp_dict, obs_chunked_amp_dict)

	def test_normal_case(self):
		d = self.test_df.to_dict(orient='index')

		obs_seq_dict, obs_chunked_amp_dict = sequence_dict_from_df(d,
																													self.window_size,
																													self.step_len)

		exp_seq_dict = {
			'A': 'MVRCCRSLHS',
			'B': 'MRRLGLVMLVLLLL',
			'C': 'MQDRQHYFMIAFTWFLVFLVLGPQA',
			'D': 'APVNDGTEADNDERAASLLVHLKGDKDGGGLTGSPDGVSAGTTDGTDSSKELAGG',
			'E': 'APVNDGTEADNDERAASLLVHLKGDKDGGGLTGSPDGVSAGTTDGTDSSKELAGG',
			'F': 'MVRCCRSLHSAFTWF'
		}

		exp_chunked_amp_dict = {
			'A': ['MVRCCRSLHS'],
			'B': ['MRRLGLVMLV', 'LVMLVLLLL'],
			'C': ['AFTWFLVFLV', 'LVFLVLGPQA'],
			'D': ['NDERAASLLV', 'ASLLVHLKGD', 'LTGSPDGVSA', 'DGVSAGTTDG'],
			'E': ['APVNDGTEAD', 'GTEADNDERA', 'HLKGDKDGGG', 'KDGGGLTGSP', 'GTTDGTDSSK', 'TDSSKELAGG']
		}

		self.assertEqual(exp_seq_dict, obs_seq_dict)
		self.assertEqual(exp_chunked_amp_dict, obs_chunked_amp_dict)

class GetAmpRegionIndexTest(unittest.TestCase):
	def test_empty_case(self):
		seq_dict = {
			'A': 'MVRCCRSLHS',
			'B': 'MRRLGLVMLVLLLL',
			'C': 'MQDRQHYFMIAFTWFLVFLVLGPQA',
			'D': 'APVNDGTEADNDERAASLLVHLKGDKDGGGLTGSPDGVSAGTTDGTDSSKELAGG',
			'E': 'APVNDGTEADNDERAASLLVHLKGDKDGGGLTGSPDGVSAGTTDGTDSSKELAGG',
			'F': 'MVRCCRSLHSAFTWF'
		}

		chunked_amp_dict = {
			'A': ['MVRCCRSLHS'],
			'B': ['MRRLGLVMLV', 'LVMLVLLLL'],
			'C': ['AFTWFLVFLV', 'LVFLVLGPQA'],
			'D': ['NDERAASLLV', 'ASLLVHLKGD', 'LTGSPDGVSA', 'DGVSAGTTDG'],
			'E': ['APVNDGTEAD', 'GTEADNDERA', 'HLKGDKDGGG', 'KDGGGLTGSP', 'GTTDGTDSSK', 'TDSSKELAGG']
		}

		obs_indice_dict = get_amp_region_index(seq_dict, chunked_amp_dict)

		exp_indice_dict = {
			'A': [{'start': 0, 'end': 10}],
			'B': [{'start': 0, 'end': 14}],
			'C': [{'start': 10, 'end': 25}],
			'D': [{'start': 10, 'end': 25},
						{'start': 30, 'end': 45}],
			'E': [{'start': 0, 'end': 15},
						{'start': 20, 'end': 35},
						{'start': 40, 'end': 55}],
			'F': []
		}

		self.assertEqual(exp_indice_dict ,obs_indice_dict)

	def test_non_empty_case(self):
		seq_dict = {}
		chunked_amp_dict = {}

		obs_indice_dict = get_amp_region_index(seq_dict, chunked_amp_dict)
		exp_indice_dict = {}

		self.assertEqual(exp_indice_dict ,obs_indice_dict)

class GetAmpSubsequencesTest(unittest.TestCase):
	def test_normal_case(self):
		indice_dict = {
			'A': [{'start': 0, 'end': 10}],
			'B': [{'start': 0, 'end': 14}],
			'C': [{'start': 10, 'end': 25}],
			'D': [{'start': 10, 'end': 25},
						{'start': 30, 'end': 45}],
			'E': [{'start': 0, 'end': 15},
						{'start': 20, 'end': 35},
						{'start': 40, 'end': 55}],
			'F': []
		}

		seq_dict = {
			'A': 'MVRCCRSLHS',
			'B': 'MRRLGLVMLVLLLL',
			'C': 'MQDRQHYFMIAFTWFLVFLVLGPQA',
			'D': 'APVNDGTEADNDERAASLLVHLKGDKDGGGLTGSPDGVSAGTTDGTDSSKELAGG',
			'E': 'APVNDGTEADNDERAASLLVHLKGDKDGGGLTGSPDGVSAGTTDGTDSSKELAGG',
			'F': 'MVRCCRSLHSAFTWF'
		}

		exp_amp_dict = {
			'A': [{'subSequence': 'MVRCCRSLHS', 'isAMP': True}],

			'B': [{'subSequence': 'MRRLGLVMLVLLLL', 'isAMP': True}],

			'C': [{'subSequence': 'MQDRQHYFMI', 'isAMP': False},
						{'subSequence': 'AFTWFLVFLVLGPQA', 'isAMP': True}],

			'D': [{'subSequence': 'APVNDGTEAD', 'isAMP': False},
						{'subSequence': 'NDERAASLLVHLKGD', 'isAMP': True},
						{'subSequence': 'KDGGG', 'isAMP': False},
						{'subSequence': 'LTGSPDGVSAGTTDG', 'isAMP': True},
						{'subSequence': 'TDSSKELAGG', 'isAMP': False}],

			'E': [{'subSequence': 'APVNDGTEADNDERA', 'isAMP': True},
						{'subSequence': 'ASLLV', 'isAMP': False},
						{'subSequence': 'HLKGDKDGGGLTGSP', 'isAMP': True},
						{'subSequence': 'DGVSA', 'isAMP': False},
						{'subSequence': 'GTTDGTDSSKELAGG', 'isAMP': True}],

			'F': [{'subSequence': 'MVRCCRSLHSAFTWF', 'isAMP': False}]
		}

		obs_amp_dict = get_amp_subsequences(indice_dict, seq_dict)

		self.assertEqual(exp_amp_dict, obs_amp_dict)

class GetProbabilityProfileTest(unittest.TestCase):
	def setUp(self):
		# Parameters
		self.step_len = 5

		mock_data = StringIO(sample_string)
		test_df = pd.read_csv(mock_data).set_index(['seqID', 'level'])
		self.test_df = test_df

	def test_normal_case(self):
		d = self.test_df.to_dict(orient='index')

		obs_prob_profile = get_probability_profile(d, self.step_len)

		exp_prob_profile = {
			'A': [{'Start': 0, 'End': 10, 'Probability': '50.1'}],

			'B': [{'Start': 0, 'End': 10, 'Probability': '80.4'},
						{'Start': 5, 'End': 14, 'Probability': '70.4'}],

			'C': [{'Start': 0, 'End': 10, 'Probability': '12.9'},
						{'Start': 5, 'End': 15, 'Probability': '22.9'},
						{'Start': 10, 'End': 20, 'Probability': '72.9'},
						{'Start': 15, 'End': 25, 'Probability': '82.9'}],

			'D': [{'Start': 0, 'End': 10, 'Probability': '23.2'},
						{'Start': 5, 'End': 15, 'Probability': '3.2'},
						{'Start': 10, 'End': 20, 'Probability': '53.2'},
						{'Start': 15, 'End': 25, 'Probability': '73.2'},
						{'Start': 20, 'End': 30, 'Probability': '3.2'},
						{'Start': 25, 'End': 35, 'Probability': '3.2'},
						{'Start': 30, 'End': 40, 'Probability': '78.2'},
						{'Start': 35, 'End': 45, 'Probability': '93.2'},
						{'Start': 40, 'End': 50, 'Probability': '13.2'},
						{'Start': 45, 'End': 55, 'Probability': '33.2'}],

			'E': [{'Start': 0, 'End': 10, 'Probability': '53.2'},
						{'Start': 5, 'End': 15, 'Probability': '73.2'},
						{'Start': 10, 'End': 20, 'Probability': '3.2'},
						{'Start': 15, 'End': 25, 'Probability': '13.2'},
						{'Start': 20, 'End': 30, 'Probability': '63.2'},
						{'Start': 25, 'End': 35, 'Probability': '73.2'},
						{'Start': 30, 'End': 40, 'Probability': '38.2'},
						{'Start': 35, 'End': 45, 'Probability': '43.2'},
						{'Start': 40, 'End': 50, 'Probability': '83.2'},
						{'Start': 45, 'End': 55, 'Probability': '93.2'}],

			'F': [{'Start': 0, 'End': 10, 'Probability': '10.1'},
						{'Start': 5, 'End': 15, 'Probability': '22.9'}]
		}

		self.assertEqual(exp_prob_profile, obs_prob_profile)

if __name__ == '__main__':
	unittest.main()