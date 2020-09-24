import React, { useMemo, useCallback } from 'react';
import {useDropzone} from 'react-dropzone';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fileUploadHandleChange } from '../../redux/actions/fileUploadAction';
import { FILE_SIZE_LIMIT } from '../../Configs/Constants';

const baseStyle = {
  position: 'relative',
  width: '100%',
  borderRadius: '15px',
  borderWidth: 3,
  borderColor: '#BEBEBE',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#000000',
  outline: 'none',
  transition: 'border .24s ease-in-out'
};

// Tricky to use dynamic border styles because acceptStyle/rejectStyle
// can only be used with valid MIME types (i.e. specifying extension doesn't work)
// Some formats (e.g. csv) have platform dependent MIME types (Windows and MacOS have different MIME for csv)

// Looks like react-dropzone only supports inline styling or 
// styled components as of 2019.
export function DropZone(props) {
  // Props passsed from parent component (UploadElementMain.js)
  const { label = "Protein sequences (.fasta, .fa)", acceptedExtensions=".fasta,.fa" } = props

  // Redux action
  const { fileUploadHandleChange } = props

  const onDrop = useCallback(acceptedFiles => {
    fileUploadHandleChange(FILE_SIZE_LIMIT, acceptedFiles)
  }, [])

  const {
    getRootProps,
    getInputProps,
  } = useDropzone({
    accept: acceptedExtensions,
    onDrop
  });

  const style = useMemo(() => ({
    ...baseStyle
  }), []);

  return (
    <div className="input-upload-dropzone-wrapper" {...getRootProps({style})}>
      <div className="input-upload-dropzone-icon">
        <CloudUploadOutlinedIcon className="input-upload-dropzone-sub-icon"/>
      </div>
      <input {...getInputProps({onChange: e => {fileUploadHandleChange(FILE_SIZE_LIMIT, e.target.files)}})}/>
      <div className="input-upload-dropzone-label-container">
        <p className="input-upload-dropzone-sub-label main">{label}</p>
        <p className="input-upload-dropzone-sub-label misc">Drag & Drop or Click</p>
      </div>
    </div>    
  );
}

DropZone.propTypes = {
  label: PropTypes.string,
  fileUploadHandleChange: PropTypes.func.isRequired
}

const mapStateToProps = state => ({

})

export default connect(mapStateToProps, { fileUploadHandleChange })(DropZone)