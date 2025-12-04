import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchRevisions, clearCurrentArticle } from '../../store/article.reducer';
import Loading from '../Loading/Loading';

const RevisionHistory = () => {
  const dispatch = useDispatch();
  const { title } = useParams();
  const { revisions, loading, error } = useSelector((state) => state.article);

  useEffect(() => {
    if (title) {
      dispatch(fetchRevisions({
        title: decodeURIComponent(title),
        limit: 50,
      }));
    }

    return () => {
      dispatch(clearCurrentArticle());
    };
  }, [dispatch, title]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading revision history: {error}</p>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Revision History: {decodeURIComponent(title)}
        </h1>
      </div>

      {revisions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No revision history available</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {revisions.map((revision) => (
              <li key={revision.revid} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Revision {revision.revid}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      by {revision.user || 'Unknown'} on {formatDate(revision.timestamp)}
                    </p>
                    {revision.comment && (
                      <p className="text-sm text-gray-600 mt-1 italic">
                        {revision.comment}
                      </p>
                    )}
                    {revision.size && (
                      <p className="text-xs text-gray-400 mt-1">
                        Size: {revision.size} bytes
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RevisionHistory;

