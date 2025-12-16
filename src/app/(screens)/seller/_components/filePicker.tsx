import moment from "moment";
// import "./styles.scss";
import Dropzone from "react-dropzone";
import { PiFilesThin } from "react-icons/pi";
import { FaCheck } from "react-icons/fa6";
import { BsFileEarmarkFill } from "react-icons/bs";
import React from "react";
const FilePicker = (props: any) => {
  const handleDrop = (acceptedFiles: any) => {
    const selectedFile = acceptedFiles[0];
    const url = URL.createObjectURL(selectedFile);
    let obj = {
      file: selectedFile,
      url: url,
    };
    props.onSubmit(obj);
  };
  return (
    <Dropzone onDrop={handleDrop}>
      {({ getRootProps, getInputProps }) => (
        <section>
          <div {...getRootProps({ className: "sellerRegister-ImagePicker" })}>
            <input {...getInputProps()} />
            <div className="sellerRegister-ImagePickerBox">
              {props.fileName ? (
                <>
                  <div>
                    <BsFileEarmarkFill size={55} color="#5cc447" />
                  </div>
                  <div style={{ flex: 1, marginLeft: 10 }}>
                    {props?.fileName.name}
                  </div>
                  <div>
                    <FaCheck color="green" size={20} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <PiFilesThin size={60} color="grey" />
                  </div>
                  <div>
                    <div style={{ marginLeft: 10 }}>
                      Drag 'n' drop file here, or click to select files
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </Dropzone>
  );
};
export default FilePicker;
