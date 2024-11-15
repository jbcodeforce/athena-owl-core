import { Button, FileUploaderItem, InlineNotification, Loading } from "@carbon/react";
import { Document, DocumentMultiple_02, Upload } from "@carbon/react/icons";
import React, { useRef, useState } from "react";
import { useTranslation } from 'react-i18next';

const UploadDocument = ({ env, updateFiles, setError }) => {
    const [file, setFile] = useState();
    const [uploadStatus, setUploadStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const { t, i18n } = useTranslation();

    const hiddenFileInputRef = useRef(null);

    const updateFile = (event) => {
        const file0 = event.target.files[0];
        if (file0) {
            setFile(file0);
        };
    }

    const uploadFile = async () => {
        const formData = new FormData();
        formData.append('myFile', file);
        formData.append('type', file.type);

        const name = encodeURIComponent(file.name.split('.').slice(0, -1).join(' '));
        const description = encodeURIComponent(file.name.split('.').slice(0, -1).join(' ').replace(/[-_]/g, ' '));
        const type = file.type === "application/pdf" ? "pdf" :
            file.type === "text/html" ? "html" :
                file.type === "text/plain" ? "text" : "md";
        const fileName = encodeURIComponent(file.name);
        const collectionName = env.collectionName || "owl_default";

        setLoading(true);
        try {
            const response = await fetch(`${env.backendBaseAPI}a/documents/?name=${name}&description=${description}&type=${type}&file_name=${fileName}&collection_name=${collectionName}`,
                {
                    method: 'POST',
                    body: formData,
                });

            if (response.ok) {
                console.log('Upload successful');
                const responseBody = await response.json();
                console.log('Response Body:', responseBody);
                setUploadStatus({ kind: "success", text: file.name + ' uploaded' });
                setFile();
                updateFiles();
            } else {
                setUploadStatus({ kind: "error", text: file.name + ' NOT uploaded. ' + response.statusText });
                console.error('Upload failed', response.statusText);
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            setError('Error uploading document:' + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <input
                type="file"
                ref={hiddenFileInputRef}
                multiple={false}
                onChange={(updateFile)}
                accept={['text/plain', 'text/html', 'text/x-markdown', 'application/pdf']}
                style={{ display: 'none' }}
                id="file-upload"
            />
            <Button
                renderIcon={Document}
                iconDescription="Select a file to upload"
                onClick={() => hiddenFileInputRef.current.click()}
                style={{ width: "14rem", borderRadius: "1rem", marginBottom: "1rem" }}>Select a file to upload</Button>
            {file && <FileUploaderItem name={file.name} status="edit"
                iconDescription="Delete file"
                onDelete={() => setFile()}
                errorBody="500kb max file size. Select a new file and try again."
                errorSubject="File size exceeds limit" invalid={false} />}

            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
                {file && <Button kind="tertiary" renderIcon={Upload} iconDescription="Upload to Vector Store" onClick={() => uploadFile()}>Upload to Vector Store</Button>}
                {loading && <Loading withOverlay={false} small style={{ marginLeft: "1rem" }} />}
            </div>
            {uploadStatus && (
                <InlineNotification
                    aria-label="closes notification"
                    kind={uploadStatus.kind}
                    onClose={() => setUploadStatus(null)}
                    onCloseButtonClick={() => setUploadStatus(null)}
                    statusIconDescription="notification"
                    subtitle={uploadStatus.text}
                    title="Upload file: "
                />)}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }} />
        </div>
    );
};

export default UploadDocument;