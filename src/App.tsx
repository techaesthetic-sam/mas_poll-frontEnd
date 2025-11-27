import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreatePoll from './pages/CreatePoll';
import PollDetail from './pages/PollDetail';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePoll />} />
          <Route path="/polls/:id" element={<PollDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
