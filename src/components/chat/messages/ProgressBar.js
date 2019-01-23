import React from 'react';
import { Progress } from 'semantic-ui-react';

const ProgressBar = ({ uploadState, percentUploaded }) => {
  if (uploadState === 'uploading') {
    return (
      <Progress
        progress
        indicating
        size="medium"
        inverted
        percent={percentUploaded}
        className="progress__bar"
      >
        <p>progress</p>
      </Progress>
    );
  } else {
    return '';
  }
};

export default ProgressBar;
