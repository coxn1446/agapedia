import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchArticles } from '../../store/article.reducer';
import Loading from '../Loading/Loading';

const ArticleList = () => {
  const dispatch = useDispatch();
  const { articles, loading, error } = useSelector((state) => state.article);

  useEffect(() => {
    dispatch(fetchArticles());
  }, [dispatch]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading articles: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Articles</h1>
        <p className="text-gray-600">Browse all articles in the wiki</p>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No articles found. Create the first article!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {articles.map((article) => (
              <li key={article.id || article.title}>
                <Link
                  to={`/article/${encodeURIComponent(article.title)}`}
                  className="block hover:bg-gray-50 px-6 py-4 transition-colors"
                >
                  <h3 className="text-lg font-medium text-gray-900">{article.title}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ArticleList;

