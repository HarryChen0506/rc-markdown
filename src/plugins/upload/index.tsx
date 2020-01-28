import Icon from 'components/Icon';
import i18n from 'i18n';
import { PluginComponent, PluginProps } from 'plugins/Plugin';
import * as React from 'react';
import { isPromise } from 'utils/tool';
import getUploadPlaceholder from 'utils/uploadPlaceholder';
import InputFile from './inputFile';

interface State {
  show: boolean;
}

export default class Upload extends PluginComponent<PluginProps, State> {
  static pluginName = 'upload';

  private inputFile: React.RefObject<InputFile>;

  constructor(props: any) {
    super(props);

    this.inputFile = React.createRef();
    this.onImageChanged = this.onImageChanged.bind(this);
    this.handleCustomImageUpload = this.handleCustomImageUpload.bind(this);
    this.handleImageUpload = this.handleImageUpload.bind(this);

    this.state = {
      show: false,
    };
  }

  private handleImageUpload() {
    const { onImageUpload } = this.editorConfig;
    if (typeof onImageUpload === 'function') {
      if (this.inputFile.current) {
        this.inputFile.current.click();
      }
    } else {
      this.editor.insertMarkdown('image');
    }
  }

  private onImageChanged(file: File) {
    const { onImageUpload } = this.editorConfig;
    if (onImageUpload) {
      const placeholder = getUploadPlaceholder(file, onImageUpload);
      this.editor.insertPlaceholder(placeholder.placeholder, placeholder.uploaded);
    }
  }

  private handleCustomImageUpload(e: any) {
    const onCustomImageUpload = this.getConfig('onCustomImageUpload', null);
    if (onCustomImageUpload) {
      const res = onCustomImageUpload.call(this, e);
      if (isPromise(res)) {
        res.then(({ url }) => {
          if (url) {
            this.editor.insertMarkdown('image', { imageUrl: url });
          }
        });
      }
    }
  }

  render() {
    const isCustom = this.getConfig('onCustomImageUpload', null) !== null;
    return isCustom ? (
      <span className="button button-type-image" title={i18n.get('btnImage')} onClick={this.handleCustomImageUpload}>
        <Icon type="icon-photo" />
      </span>
    ) : (
      <span
        className="button button-type-image"
        title={i18n.get('btnImage')}
        onClick={this.handleImageUpload}
        style={{ position: 'relative' }}
      >
        <Icon type="icon-photo" />
        <InputFile
          accept={this.getConfig('imageAccept', '')}
          ref={this.inputFile}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            e.persist();
            if (e.target.files && e.target.files.length > 0) {
              this.onImageChanged(e.target.files[0]);
            }
          }}
        />
      </span>
    );
  }
}