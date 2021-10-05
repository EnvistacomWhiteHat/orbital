import { useEffect, useState } from 'react';
import { IFile } from '../../../types';
import { useAppSelector } from '../../../store/hooks';
import { videoExtensions } from '../../../../common/fileExtensions';

import PreviewImageFile from './PreviewImageFile';
import PreviewVideoFile from './PreviewVideoFile';

import InfiniteScroll from 'react-infinite-scroll-component';

export default function Files() {
  const { files } = useAppSelector((state) => state.folder);
  const { query } = useAppSelector((state) => state.search);
  const { filesToLoad } = useAppSelector((state) => state.settings);

  const [filteredFiles, setFilteredFiles] = useState<Array<IFile>>([]);
  const [infiniteFiles, setInfiniteFiles] = useState<Array<IFile>>([]);
  const [hasMoreFiles, setHasMoreFiles] = useState(true);

  useEffect(() => {
    // TODO V2: Sort files by name using the sortByName redux variable.
    const filteredFiles = files.filter((file) => file.path.includes(query));
    setFilteredFiles(filteredFiles);

    const initialFiles: Array<IFile> = [];
    const numOfFiles =
      filteredFiles.length < filesToLoad ? filteredFiles.length : filesToLoad;

    for (let i = 0; i < numOfFiles; i++) {
      initialFiles.push(filteredFiles[i]);
    }
    setInfiniteFiles([...initialFiles]);

    if (filteredFiles.length < filesToLoad) {
      setHasMoreFiles(false);
    } else {
      setHasMoreFiles(true);
    }

    // eslint-disable-next-line
  }, [query]);

  // TODO V2: Fix fake loading bug when scroll not activated.
  const updateInfiniteFiles = () => {
    const nextSetOfFiles: Array<IFile> = [];

    const numOfFiles =
      infiniteFiles.length + filesToLoad > filteredFiles.length
        ? filteredFiles.length
        : infiniteFiles.length + filesToLoad;

    for (let i = infiniteFiles.length; i < numOfFiles; i++) {
      nextSetOfFiles.push(filteredFiles[i]);
    }

    if (infiniteFiles.length + filesToLoad > filteredFiles.length) {
      setHasMoreFiles(false);
    } else {
      setHasMoreFiles(true);
    }

    setInfiniteFiles([...infiniteFiles, ...nextSetOfFiles]);
  };

  const isVideoFile = (path: string): boolean => {
    const isVideoFile = videoExtensions.some((videoExtension) => {
      return path.includes(`.${videoExtension}`);
    });
    return isVideoFile;
  };

  const getPreviewComponent = (file: IFile): JSX.Element => {
    const previewComponentMap = {
      video: <PreviewVideoFile {...file} />,
      image: <PreviewImageFile {...file} />,
    };

    return isVideoFile(file.path)
      ? previewComponentMap.video
      : previewComponentMap.image;
  };

  return (
    <div
      id="scrollableDiv"
      className="absolute top-24 inset-x-0 bottom-0 px-16 py-8 scrollbar scrollbar-thumb-scrollbar-fg scrollbar-track-scrollbar-bg"
    >
      {infiniteFiles.length === 0 ? (
        <div>No files match your search query 😭</div>
      ) : (
        <InfiniteScroll
          dataLength={infiniteFiles.length}
          next={updateInfiniteFiles}
          hasMore={hasMoreFiles}
          loader={<h4>Loading...</h4>}
          scrollableTarget="scrollableDiv"
          className="scrollbar-none"
        >
          {/* TODO V2: Maybe use grid instead of flex box? */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 justify-items-center">
            {infiniteFiles.map((file: IFile) => {
              return (
                <div
                  key={`file-protocol://getMediaFile/${file.path}`}
                  className="h-60 md:h-56 lg:h-52 xl:h-40 min-w-full"
                >
                  {getPreviewComponent(file)}
                </div>
              );
            })}
          </div> */}
          <div className="flex flex-wrap justify-items-center">
            {infiniteFiles.map((file: IFile) => {
              return (
                <div
                  key={`file-protocol://getMediaFile/${file.path}`}
                  className="h-60 w-80 flex-initial flex-grow m-1"
                >
                  {getPreviewComponent(file)}
                </div>
              );
            })}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}
