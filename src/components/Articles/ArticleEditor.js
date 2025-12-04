import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchArticle, updateArticle } from '../../store/article.reducer';
import Loading from '../Loading/Loading';

const ArticleEditor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { title } = useParams();
  const { currentArticle, loading, error } = useSelector((state) => state.article);

  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (title) {
      dispatch(fetchArticle(decodeURIComponent(title)));
    }
  }, [dispatch, title]);

  useEffect(() => {
    if (currentArticle) {
      setContent(currentArticle.content || '');
    }
  }, [currentArticle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await dispatch(updateArticle({
        title: decodeURIComponent(title),
        content,
        summary,
      })).unwrap();

      navigate(`/article/${encodeURIComponent(title)}`);
    } catch (err) {
      console.error('Error updating article:', err);
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error && !currentArticle) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading article: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Edit: {currentArticle?.title || decodeURIComponent(title)}
        </h1>
        <p className="text-gray-600">Edit this article using WikiText syntax</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
            Edit Summary (optional)
          </label>
          <input
            type="text"
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description of your changes"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content (WikiText)
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="Enter WikiText content here..."
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            Use WikiText syntax. For example: <code>[[Article Name]]</code> for links, <code>**bold**</code> for bold text.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/article/${encodeURIComponent(title)}`)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleEditor;

