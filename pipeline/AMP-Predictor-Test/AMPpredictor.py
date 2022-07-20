import luigi
import logging
import os
import subprocess
import pandas as pd
import joblib
import json
import pickle

# Import custom scripts
from scripts import read_fasta
from scripts import get_reduced_form
from scripts import reduced_matrix
from scripts import generate_profile
from scripts import sliding_window
from scripts import predict

# Change working directory to luigi
# Assumes luigi directory is inside the web-app dir
#os.chdir('AMP-Predictor-Test')

#config_path = "/pipeline/AMP-Predictor-Test/configuration/luigi.cfg"
#luigi.configuration.add_config_path(config_path)
logger = logging.getLogger("AMP-pipeline logger")

def run_cmd(cmd):
    proc = subprocess.Popen(cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    stdout, stderr = proc.communicate()

    return_code = proc.returncode

    if not(return_code == 0):
        combined_msg = (stdout + stderr).decode('utf-8')
        web_err_msg = "<-->" + combined_msg + "<-->"

        raise ValueError(web_err_msg)
    else:
        return stdout

class uid(luigi.Config):
    uid = luigi.Parameter()

class base_outdir(luigi.Config):
    base_dir = luigi.Parameter()

class output_dirs(luigi.Config):
    #parent_dir = "outputs" # Base dir
    #uid = uid().uid # Actual output dir
    #out_dir = os.path.join(parent_dir, str(uid))
    out_dir = base_outdir().base_dir

    test_preprocessed_dir = os.path.join(out_dir, "test_preprocessed")
    renamed_dir = os.path.join(out_dir, "renamed")
    prediction_dir = os.path.join(out_dir, "prediction")
    misc_dir = os.path.join(out_dir, "miscellaneous")
    hmm_dir = os.path.join(out_dir, "hmmscan")

class model_meta_data(luigi.Config):
    fit = luigi.Parameter()
    kmers_file = luigi.Parameter()

class reduced_form(luigi.Config):
    is_reduced = luigi.Parameter()
    dayhoff = luigi.Parameter()
    diamond = luigi.Parameter()
    murphy_4 = luigi.Parameter()
    murphy_8 = luigi.Parameter()
    murphy_10 = luigi.Parameter()

class samples(luigi.Config):
    unlabeled_fasta = luigi.Parameter(default=None)

class Rename_fasta(luigi.Task):
    """
    Rename fasta headers, and return {new header: old header} key-value pair
    """
    fasta = samples().unlabeled_fasta

    def output(self):
        renamed_fasta = os.path.join(output_dirs().renamed_dir, "renamed.fasta")
        header_dict = os.path.join(output_dirs().renamed_dir, "header.json")

        output = {
                'renamed': luigi.LocalTarget(renamed_fasta,
                    format=luigi.format.Nop),
                'header': luigi.LocalTarget(header_dict)
                }

        return output

    def run(self):
        # Make output directory if not exist
        run_cmd(['mkdir',
                '-p',
                output_dirs().renamed_dir])

        # Read fasta and get header
        header_dict = {}
        prefix = "seq"
        idx = 1
        with open(self.fasta, 'r') as fh:
            for line in fh:
                line = line.strip()
                # Fasta header should start with ">"
                if(line.startswith(">")):
                    header = line.strip(">")
                    new_header = prefix + str(idx)
                    header_dict[new_header] = header
                    idx = idx + 1

        # Store header dictionary as JSON to parse later
        with self.output()['header'].open('w') as fh:
            json.dump(header_dict, fh)

        # Write renamed fasta to a file
        cmd = ['awk',
                'BEGIN {idx=1} {if(/^>/) {print ">seq"idx; idx++} else {print}}',
                self.fasta]

        output = run_cmd(cmd)

        with self.output()['renamed'].open('wb') as fh:
            fh.write(output)

class Read_fasta(luigi.Task):

    def requires(self):
        return Rename_fasta()

    def output(self):
        fasta_dict = os.path.join(output_dirs().test_preprocessed_dir,
                "unlabeled_dict.json")

        return luigi.LocalTarget(fasta_dict)

    def run(self):
        # Make output directory if not exist
        run_cmd(['mkdir',
                '-p',
                output_dirs().test_preprocessed_dir])

        # Read fasta
        fasta = self.input()['renamed'].path
        fasta_dict = read_fasta.read_fasta(fasta)

        with self.output().open('w') as fh:
            json.dump(fasta_dict, fh)

class HMMscan(luigi.Task):
    hmmdb = luigi.Parameter()
    model_evalue = luigi.Parameter(default=0.1)
    dom_evalue = luigi.Parameter(default=0.1)
    cores = luigi.Parameter(default=1)

    def requires(self):
        return Rename_fasta()

    def output(self):
        hmmscan_output = os.path.join(output_dirs().hmm_dir, "hmmscan_raw.out")

        return luigi.LocalTarget(hmmscan_output)

    def run(self):
        # Create output directory
        run_cmd([
            'mkdir',
            '-p',
            output_dirs().hmm_dir
            ])

        # Run HMMscan
        fasta = self.input()['renamed'].path
        run_cmd([
            'hmmscan',
            '--domtblout',
            self.output().path,
            '-E',
            self.model_evalue,
            '--domE',
            self.dom_evalue,
            '--cpu',
            self.cores,
            self.hmmdb,
            fasta
            ])

class Extract_HMMscan_Metadata(luigi.Task):

    def requires(self):
        return HMMscan()

    def output(self):
        hmm_accessions = os.path.join(output_dirs().hmm_dir, "hmm_metadata.json")

        return luigi.LocalTarget(hmm_accessions)

    def run(self):
        # Load HMMscan raw output
        hmm_accessions = set()
        hmm_raw = []
        with self.input().open('r') as fh:
            for line in fh:
                line = line.strip()
                # skip commented lines
                if("#" in line):
                    continue

                hmm_raw.append(line)

        # Get accessions from raw hmmscan output
        # Assumes it has full header information as obtained from Uniprot
        # e.g. tr|A0A060WL84|A0A060WL84_ONCMY
        # Think of a way to deal with inconsistent headers

        # Store hmm metadata
        hmm_dict = {}
        for line in hmm_raw:
            hmm_metadata = []
            tmp = {}
            
            line = line.strip()
            info = line.split()

            if("|" in info[3]):
                accession = info[3].split("|")[1]
            else:
                accession = info[3].strip()

            domain = info[0]
            evalue = info[6]
            ali_start = info[17]
            ali_end = info[18]

            tmp['domain'] = domain.split('_')[0]
            tmp['evalue'] = evalue
            tmp['start'] = ali_start
            tmp['end'] = ali_end

            hmm_metadata.append(tmp)

            # if seq already exists, extend the list
            if(accession in hmm_dict):
                hmm_dict[accession].extend(hmm_metadata)
            # if not, add a new entry
            else:
                hmm_dict[accession] = hmm_metadata

        with self.output().open('w') as fh:
            json.dump(hmm_dict, fh)

class Filter_fasta(luigi.Task):
    threshold = luigi.IntParameter(default=100)

    def requires(self):
        return {
                "hmm": Extract_HMMscan_Metadata(),
                "fasta": Read_fasta()
                }

    def output(self):
        filtered = os.path.join(output_dirs().test_preprocessed_dir,
                "filtered_unlabeled_fasta.csv")

        return luigi.LocalTarget(filtered)

    def run(self):
        # Load input
        with self.input()["hmm"].open('r') as fh:
            hmm_dict = json.load(fh)

        with self.input()["fasta"].open('r') as fh:
            fasta_dict = json.load(fh)

        fasta_df = pd.DataFrame(
                fasta_dict.items(),
                columns=['seq_ID', 'sequence']
                ).set_index('seq_ID')

        # Add length
        fasta_df['length'] = fasta_df['sequence'].str.len()

        # Filter by length; keep all sequence less than threshold in length
        short_sequence_ids = fasta_df[fasta_df['length'] <= self.threshold].index
        long_sequence_ids = fasta_df[fasta_df['length'] > self.threshold].index

        # Further filter by HMM for long sequences
        hmm_accessions = set(hmm_dict.keys())
        long_hmm_ids = hmm_accessions.intersection(set(long_sequence_ids))

        # Get final list of IDs
        filtered_ids = long_hmm_ids.union(set(short_sequence_ids))

        filtered_df = fasta_df.loc[filtered_ids]

        if (filtered_df.empty):
        	message = "<---Input sequences have no known AMP domains and are longer than {} amino acids.<---".format(self.threshold)
        	raise ValueError(message)

        with self.output().open('w') as fh:
            filtered_df.to_csv(fh)

class Sliding_window(luigi.Task):
    window_size = luigi.IntParameter(default=60)
    stride_len = luigi.IntParameter(default=10)

    def requires(self):
        return Filter_fasta()

    def output(self):
        chunked_df = os.path.join(output_dirs().test_preprocessed_dir,
                "chunked_unlabeled_fasta.csv")

        return luigi.LocalTarget(chunked_df)

    def run(self):
        # Load input
        with self.input().open('r') as fh:
            filtered_df = pd.read_csv(fh).set_index('seq_ID')

        chunked_df = sliding_window.apply_sliding_window(
                filtered_df,
                self.window_size,
                self.stride_len
                )

        with self.output().open('w') as fh:
            chunked_df.to_csv(fh)

class Convert_to_reduced(luigi.Task):

    def requires(self):
        # For proteome screening
        return Sliding_window()

        # For benchmark testing
        #return Read_fasta()

    def output(self):
        output = {}

        fasta_reduced = os.path.join(output_dirs().test_preprocessed_dir,
                "unlabeled_reduced.pkl")

        # Adding "luigi.format.Nop" opens the file in binary mode

        return luigi.LocalTarget(fasta_reduced, format=luigi.format.Nop)

    def run(self):
        # Make output directory if not exist
        run_cmd(['mkdir',
                '-p',
                output_dirs().test_preprocessed_dir])

        # Load input protein dictionary
        with self.input().open('r') as fh:
            # For proteome screening
            fasta_df = pd.read_csv(fh).set_index(['seq_ID', 'index'])

            # For benchmark testing
            #fasta_dict = json.load(fh)

            #fasta_df = pd.DataFrame(
            #        fasta_dict.items(),
            #        columns=['ID', 'sequence']
            #        ).set_index('ID')

        # Convert to reduced format
        method_dict = {"dayhoff": reduced_form().dayhoff,
                    "diamond": reduced_form().diamond,
                    "murphy_4": reduced_form().murphy_4,
                    "murphy_8": reduced_form().murphy_8,
                    "murphy_10": reduced_form().murphy_10}

        # Get reduced matrix
        reduced_matrices = {}

        for method in method_dict:
            reduced_matrices[method] = reduced_matrix.\
                                        get_reduced_matrix(method)

        fasta_reduced = get_reduced_form.convert_to_reduced(
                fasta_df,
                reduced_form().is_reduced,
                method_dict,
                reduced_matrices)

        # Save output
        with self.output().open('w') as fh:
            pickle.dump(fasta_reduced, fh)

class Get_kmers_table(luigi.Task):
    core = luigi.IntParameter(default=1)

    def requires(self):
        return Convert_to_reduced()

    def output(self):
        kmers_table = os.path.join(output_dirs().misc_dir, "kmers_table.pkl")
        return luigi.LocalTarget(kmers_table, format=luigi.format.Nop)

    def run(self):
        # Make directory it not exist
        run_cmd([
            'mkdir',
            '-p',
            output_dirs().misc_dir
            ])

        method_dict = {"dayhoff": reduced_form().dayhoff,
                    "diamond": reduced_form().diamond,
                    "murphy_4": reduced_form().murphy_4,
                    "murphy_8": reduced_form().murphy_8,
                    "murphy_10": reduced_form().murphy_10}

        reduced_matrices = {}

        for method in method_dict:
            reduced_matrices[method] = reduced_matrix.\
                                        get_reduced_matrix(method)

        kmers_dict = generate_profile.compute_kmer_table(
                reduced_form().is_reduced,
                method_dict,
                reduced_matrices,
                self.core)

        with self.output().open('w') as fh:
            pickle.dump(kmers_dict, fh)

class Calculate_relative_frequency_profile(luigi.Task):
    core = luigi.IntParameter(default=1)

    def requires(self):
        return {
                "reduced_form": Convert_to_reduced(),
                "kmers_table": Get_kmers_table()
                }

    def output(self):
        fasta_relative_profile = os.path.join(output_dirs().test_preprocessed_dir,
                "unlabeled_rel_freq_profile.csv")	

        return luigi.LocalTarget(fasta_relative_profile)

    def run(self):
        # Load inputs
        with self.input()["kmers_table"].open('r') as fh:
            kmers_tables = pickle.load(fh)
        with self.input()["reduced_form"].open('r') as fh:
            fasta_reduced = pickle.load(fh)

        fasta_reduced_with_len = generate_profile.calculate_length(fasta_reduced)

        fasta_rel_freq_df = generate_profile.calculate_relative_frequency(
                fasta_reduced_with_len,
                kmers_tables,
                self.core
                )

        with self.output().open('w') as fh:
            fasta_rel_freq_df.to_csv(fh)

class Predict_sliding_window(luigi.Task):
    window_size = luigi.IntParameter(default=60)
    stride_len = luigi.IntParameter(default=10)

    def requires(self):
        return {
                "relative_freq": Calculate_relative_frequency_profile(),
                "hmm": Extract_HMMscan_Metadata(),
                "original": Sliding_window(),
                "Rename_fasta": Rename_fasta()
                }

    def output(self):
        # JSON output
        all_prediction = os.path.join(output_dirs().prediction_dir,
            "unlabeled_prediction.json")

        return luigi.LocalTarget(all_prediction)

    def run(self):
        # Make prediction directory if not exist
        run_cmd([
            'mkdir',
            '-p',
            output_dirs().prediction_dir
            ])
        # Retrieve header dictionary that maps new header to old header
        with self.input()["Rename_fasta"]["header"].open('r') as fh:
            header_dict = json.load(fh)

        # Retrieve frequency profile and original sequence
        with self.input()["relative_freq"].open('r') as fh:
            fasta_rel_freq_df = pd.read_csv(fh).set_index(['seq_ID', 'index'])

        with self.input()["original"].open('r') as fh:
            original_df = pd.read_csv(fh).set_index(['seq_ID', 'index'])

        # Retrieve HMMscan accessions
        with self.input()["hmm"].open('r') as fh:
        	hmm_dict = json.load(fh)
        hmm_accessions = set(hmm_dict.keys())

        # Get a list of kmers used for training
        kmers = pd.read_csv(model_meta_data().kmers_file).\
                                            set_index('seq_ID').\
                                            columns
        # Load model file
        rf_fit = joblib.load(model_meta_data().fit)

        # Reorder columns
        fasta_rel_freq_df = fasta_rel_freq_df.reindex(
                sorted(fasta_rel_freq_df.columns), axis=1
                )

        # Only use candidate kmers
        processed_freq_df = fasta_rel_freq_df[kmers]

        pos_pred_df, neg_pred_df = predict.predict(
                rf_fit,
                processed_freq_df,
                original_df,
                hmm_accessions,
                header_dict
                )

        #pos_pred_df.to_csv("pos_pred.csv")
        #neg_pred_df.to_csv("neg_pred.csv")

        # Map headers back to original headers in hmm metadata
        for new_header in hmm_accessions:
            original_header = header_dict[new_header]

            hmm_dict[original_header] = hmm_dict.pop(new_header)

        all_pred_df = pd.concat([pos_pred_df, neg_pred_df])
        all_pred_json = self.multi_df_to_JSON(all_pred_df, hmm_dict)

        with self.output().open('w') as fh:
            json.dump(all_pred_json, fh)

    def get_amp_subsequences(self, amp_indice_dict, seq_dict):
        isAMP = True
        amp_dict = {}

        for _id in amp_indice_dict:
            amp_subseq_list = []
            start = -1
            end = -1
            prevStart = -1
            prevEnd = -1
            amp_indices = amp_indice_dict[_id]
            sequence = seq_dict[_id]

            # No AMP region
            if(len(amp_indices) == 0):
                data = {
                        'subSequence': sequence,
                        'isAMP': False
                        }
                amp_subseq_list.append(data)
                amp_dict[_id] = amp_subseq_list

            # AMP regions
            else:
                counter = 1
                for positions in amp_indices:
                    tmp_non_amp_d = {}
                    tmp_amp_d = {}
                    non_amp = ''
                    # AMP starts in the beginning? 
                    start = positions['start']
                    end = positions['end']

                    amp = sequence[start:end]
                    # First occurence
                    if(counter == 1):
                        non_amp = sequence[0:start]
                    # Last occurence
                    elif(counter == len(amp_indices)):
                        tmp_last_d = {}
                        non_amp = sequence[prevEnd:start]

                        #if(_id == 'Q64JE6'): print(non_amp)
                        if(non_amp):
                            tmp_non_amp_d['isAMP'] = False
                            tmp_non_amp_d['subSequence'] = non_amp
                            amp_subseq_list.append(tmp_non_amp_d)
                            print(amp_subseq_list)

                        tmp_amp_d['isAMP'] = True
                        tmp_amp_d['subSequence'] = amp
                        amp_subseq_list.append(tmp_amp_d)
                        #print(amp_subseq_list)

                        non_amp = sequence[end:]

                        if(non_amp):
                            tmp_last_d['isAMP'] = False
                            tmp_last_d['subSequence'] = non_amp
                            amp_subseq_list.append(tmp_last_d)

                        break

                    else:
                        non_amp = sequence[prevEnd:start]

                    prevStart = start
                    prevEnd = end
                    counter = counter +1

                    if(non_amp):
                        tmp_non_amp_d['isAMP'] = False
                        tmp_non_amp_d['subSequence'] = non_amp
                        amp_subseq_list.append(tmp_non_amp_d)

                    tmp_amp_d['isAMP'] = True
                    tmp_amp_d['subSequence'] = amp
                    amp_subseq_list.append(tmp_amp_d)

                    # Special case: only one entry
                    # Add the last bit
                    if(len(amp_indices) == 1):
                        non_amp = sequence[end:]
                        if(non_amp):
                            tmp_non_amp_d['isAMP'] = False
                            tmp_non_amp_d['subSequence'] = non_amp
                            amp_subseq_list.append(tmp_non_amp_d)


            amp_dict[_id] = amp_subseq_list


        return amp_dict

    def get_amp_region_index(self, seq_dict, chunked_amp_dict):
        amp_indice_dict = {}
        for _id in seq_dict:
            amp_indices = []
            start = -1
            end = -1
            currStart = -1
            currEnd = -1
            prevStart = -1
            prevEnd = -1
            # Sequence has AMP region
            if(_id in chunked_amp_dict):
                chunked_seqs = chunked_amp_dict[_id]

                for chunked in chunked_seqs:
                    currStart = seq_dict[_id].find(chunked)
                    currEnd = currStart + len(chunked)

                    if(prevEnd != -1):
                        # Discontinuous case
                        if(currStart > prevEnd):
                            # Store and keep track again
                            amp_indices.append({'start': start, 'end': end})
                            start = currStart
                            end = currEnd
                        # Continuous case
                        else:
                            end = currEnd
                    # First iteration
                    else:
                        start = currStart
                        end = currEnd

                    prevStart = currStart
                    prevEnd = currEnd
                    #print("{}: {}".format(_id, start))

                amp_indices.append({'start': start, 'end': end})
                # Add to dict
                amp_indice_dict[_id] = amp_indices

            # Sequence does not have AMP region in it
            else:
                amp_indice_dict[_id] = []

        return amp_indice_dict

    def get_probability_profile(self, d):
        prob_profile = {}

        prevID = ''
        currentID = ''
        regions = []

        for k in sorted(d):
            prevID = currentID
            currentID = k[0]
            region = {}

            if(currentID != prevID and prevID):
                prob_profile[prevID] = regions

                regions = []

            prob = round(d[k]['Probability'], 3) * 100
            prob_formatted = '%.1f' % prob
            start = int(k[1]) * self.stride_len
            end = start + d[k]['Length']
            region['Start'] = start
            region['End'] = end
            region['Probability'] = prob_formatted

            regions.append(region)

        # Add last entry
        prob_profile[currentID] = regions

        return prob_profile

    def multi_df_to_JSON(self, df, hmm_metadata):
        # Convert MultiIndex dataframe to JSON compatible format
        d = df.to_dict(orient='index')

        if(len(d) == 0): return

        data = []
        # d = {key: value}
        # key = (seqID, level)
        # value = data
        prevID = ''
        currentID = ''
        window_size = self.window_size
        step_len = self.stride_len

        seq = ""
        renew = False
        HMM_dict = {}
        chunked_amp_dict = {}
        seq_dict = {}


        for k in sorted(d):
            prevID = currentID
            currentID = k[0]

            # Entry already exists in the list
            if(currentID == prevID):
                # Retrieve full sequence
                chunked_seq = d[k]['Sequence']
                start = window_size - step_len
                end = len(chunked_seq)
                seq = seq + chunked_seq[start:end]

                # Get AMP region if prob >= 0.5
                if(d[k]['Probability'] >= 0.5):
                    chunked_amp_dict.setdefault(k[0], []).append(chunked_seq)

            # New entry 
            else:
                if(renew):
                    seq_dict[prevID] = seq
                    seq = ''
                renew = True

                # Retrieve full sequence
                chunked_seq = d[k]['Sequence']
                seq = seq + chunked_seq

                # Get AMP region if prob >= 0.5
                if(d[k]['Probability'] >= 0.5):
                    chunked_amp_dict.setdefault(k[0], []).append(chunked_seq)

        seq_dict[currentID] = seq

        amp_indice_dict = self.get_amp_region_index(seq_dict, chunked_amp_dict)
        amp_dict = self.get_amp_subsequences(amp_indice_dict, seq_dict)
        prob_profile = self.get_probability_profile(d)

        # Create JSON finally...
        json_data = []
        for _id in amp_dict:
            data = {
                    'seqID': _id,
                    'sequence': seq_dict[_id],
                    'ampRegion': amp_dict[_id],
                    'HMM': hmm_metadata[_id] if(_id in hmm_metadata) else False,
                    'length': len(seq_dict[_id]),
                    'probabilityProfile': prob_profile[_id]
                    }
            json_data.append(data)



        return json_data

class Predict_benchmark(luigi.Task):

    def requires(self):
        return Calculate_relative_frequency_profile()

    def output(self):
        pos_pred = os.path.join(prediction_dir, "pos_benchmark_prediction.csv")
        neg_pred = os.path.join(prediction_dir, "neg_benchmark_prediction.csv")

        output = {
                "pos": luigi.LocalTarget(pos_pred),
                "neg": luigi.LocalTarget(neg_pred)
                }

        return output

    def run(self):
        # Make prediction directory if not exist
        run_cmd([
            'mkdir',
            '-p',
            prediction_dir
            ])

        # Load relative frequency profile
        with self.input().open('r') as fh:
            fasta_rel_freq_df = pd.read_csv(fh).set_index('seq_ID')

        # Get a list of kmers used for training
        kmers = pd.read_csv(model_meta_data().kmers_file).\
                                            set_index('seq_ID').\
                                            columns
        # Load model file
        rf_fit = joblib.load(model_meta_data().fit)

        # Reorder columns
        fasta_rel_freq_df = fasta_rel_freq_df.reindex(
                sorted(fasta_rel_freq_df.columns), axis=1
                )

        # Only use candidate kmers
        processed_freq_df = fasta_rel_freq_df[kmers]

        pos_pred_df, neg_pred_df = predict.predict_benchmark(
                rf_fit,
                processed_freq_df
                )

        with self.output()["pos"].open('w') as fh:
            pos_pred_df.to_csv(fh)
        with self.output()["neg"].open('w') as fh:
            neg_pred_df.to_csv(fh)


#dummy class to run all the tasks
class proteome_screening(luigi.Task):
    def requires(self):
        task_list = [
                    Rename_fasta(),
                    Read_fasta(),
                    HMMscan(),
                    Extract_HMMscan_Metadata(),
                    Filter_fasta(),
                    Sliding_window(),
                    Convert_to_reduced(),
                    Get_kmers_table(),
                    Calculate_relative_frequency_profile(),
                    Predict_sliding_window()]
        return task_list

    def output(self):
        done = os.path.join(output_dirs().out_dir, "done")

        return luigi.LocalTarget(done)

    def run(self):
        with self.output().open('w') as fh:
            fh.write("Done!")

        

class benchmark_testing(luigi.Task):
    def requires(self):
        return [
                Rename_fasta(),
                Read_fasta(),
                Convert_to_reduced(),
                Get_kmers_table(),
                Calculate_relative_frequency_profile(),
                Predict_benchmark()
                ]
            
if __name__ == '__main__':
    luigi.run()

