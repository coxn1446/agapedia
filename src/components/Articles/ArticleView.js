import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchParsedArticle, clearCurrentArticle } from '../../store/article.reducer';
import Loading from '../Loading/Loading';
import mediawikiLinkHandler from '../../utils/mediawikiLinkHandler';

const ArticleView = () => {
  const dispatch = useDispatch();
  const { title } = useParams();
  const { parsedArticle, loading, error } = useSelector((state) => state.article);

  useEffect(() => {
    if (title) {
      dispatch(fetchParsedArticle(decodeURIComponent(title)));
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
          <p className="text-red-800">Error loading article: {error}</p>
          <Link to="/articles" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to articles
          </Link>
        </div>
      </div>
    );
  }

  if (!parsedArticle) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">Article not found</p>
          <Link to="/articles" className="text-blue-600 hover:underline">
            Back to articles
          </Link>
        </div>
      </div>
    );
  }

  // Process HTML to convert MediaWiki links to React Router links
  const processedHTML = mediawikiLinkHandler(parsedArticle.html);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{parsedArticle.title}</h1>
        <div className="flex gap-4">
          <Link
            to={`/article/${encodeURIComponent(parsedArticle.title)}/edit`}
            className="text-blue-600 hover:underline"
          >
            Edit
          </Link>
          <Link
            to={`/article/${encodeURIComponent(parsedArticle.title)}/history`}
            className="text-blue-600 hover:underline"
          >
            History
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: processedHTML }}
        />
      </div>
    </div>
  );
};

export default ArticleView;

