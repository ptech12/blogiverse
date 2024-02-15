import { useState, useEffect } from "react";
import About from "./components/About";
import Home from "./components/Home";
import NewPost from "./components/NewPost";
import NotFound from "./components/NotFound";
import PostPage from "./components/PostPage";
import Layout from "./components/Layout";
// router-dom import
import { Routes, Route, useNavigate } from "react-router-dom";
import { format } from "date-fns";
// api routes
import api from "./api/posts";
import userApi from "./api/users";
import EditPost from "./components/EditPost";
import useWindowSize from "./hooks/useWindowSize";
import { DataProvider } from "./context/DataContext";
import useAxiosFetch from "./hooks/useAxiosFetch";

function App() {
  // using states for posts
  const [posts, setPosts] = useState([]);
  // for search items
  const [search, setSearch] = useState("");
  // search results
  const [searchResult, setSearchResult] = useState([]);
  // new post state
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  // user data
  const [users, setUsers] = useState([]);

  const navigate = useNavigate();

  const { data, fetchError, isLoading } = useAxiosFetch(
    "https://dummyjson.com/posts?limit=30"
  );

  useEffect(() => {
    setPosts(data);
  }, [data]);

  useEffect(() => {
    // const fetchPosts = async () => {
    //   try {
    //     const resp = await api.get("/posts?limit=30");
    //     /*  axios automatically converts to json object */
    //     setPosts(resp.data.posts);
    //   } catch (err) {
    //     /* Nog in the 200 response range */
    //     /* know what you are dealing with backend */
    //     /* know what you will get from the backend */
    //     if (err.resp) {
    //       console.error(err.resp.data);
    //       console.log(err.resp.status);
    //       console.log(err.resp.headers);
    //     } else {
    //       console.log(`Error: ${err.message}`);
    //     }
    //   }
    // };

    const fetchUsers = async () => {
      try {
        const response = await userApi.get("/users?limit=30");
        setUsers(response.data.users);
      } catch (err) {
        if (err.resp) {
          console.error(err.resp.data);
          console.log(err.resp.status);
          console.log(err.resp.headers);
        } else {
          console.log(`Error: ${err.message}`);
        }
      }
    };

    // fetchPosts();
    fetchUsers();
    // console.log(posts);
  }, []);

  /*
    posts X search are dependency 
    as our search input provides new data
    to the [search's] essentially filter the posts
    that both matches [search] 
  */
  useEffect(() => {
    // console.log(posts);
    const filteredResults = posts.filter(
      (post) =>
        post.body.toLowerCase().includes(search.toLowerCase()) || // OR short circuit
        post.title.toLowerCase().includes(search.toLowerCase())
    );
    setSearchResult(filteredResults);
  }, [posts, search]);

  /* handle submit func to submit new post */
  const handleSubmit = async (e) => {
    // C in Create
    e.preventDefault();
    const id = posts.length ? posts[posts.length - 1].id + 1 : 1;
    // const datetime = format(new Date(), 'MMM dd, yyyy p');
    const newPost = { id, title: postTitle, body: postBody };

    try {
      const resp = await api.post("/posts/add", newPost);
      const allPosts = [...posts, resp.data];
      setPosts(allPosts);
      setPostTitle("");
      setPostBody("");
      navigate("/");
    } catch (err) {
      console.error(`Error: ${err.message}`);
      alert(`Error: ${err.message}`);
    }
  };

  const handleEdit = async (id) => {
    const datetime = format(new Date(), "MMM dd, yyyy p");
    const updatePost = { id, title: editTitle, datetime, body: editBody };
    try {
      // update block
      const resp = await api.put(`/posts?id=${id}`, updatePost);
      // only update the posts that match the id else keep it as it is
      setPosts(posts.map((post) => (post.id === id ? { ...resp.data } : post)));
      setEditBody("");
      setEditTitle("");
      navigate("/");
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  };

  /* habndle delete */
  const handleDelete = async (id) => {
    // D for delete
    try {
      const postList = posts.filter((post) => post.id !== id);
      setPosts(postList);
      navigate("/");
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  };

  return (
    <DataProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* index will be replaced by <Outlet /> component */}

          <Route index element={<Home users={users} />} />

          <Route path="post">
            <Route index element={<NewPost />} />

            <Route path="/post/:id" element={<PostPage users={users} />} />
          </Route>
          
          <Route path="edit">
            <Route path="/edit/:id" element={<EditPost />} />
          </Route>

          <Route path="about" element={<About />} />
          {/* not found */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </DataProvider>
  );
}

export default App;
