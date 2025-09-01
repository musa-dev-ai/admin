import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDf1FkJtMo6YLlk2BSv1fjark3dmpE634o",
  authDomain: "fir-shop-75d43.firebaseapp.com",
  databaseURL: "https://fir-shop-75d43-default-rtdb.firebaseio.com",
  projectId: "fir-shop-75d43",
  storageBucket: "fir-shop-75d43.firebasestorage.app",
  messagingSenderId: "276108382023",
  appId: "1:276108382023:web:b303c079df2cd29edac662"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function App() {
  const [products, setProducts] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    const productsRef = ref(db, "products");
    onValue(productsRef, snapshot => {
      const data = snapshot.val() || {};
      setProducts(Object.values(data));
    });
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if(f){
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else setPreview(null);
  };

  const uploadToCatbox = async (file) => {
    const formData = new FormData();
    formData.append("reqtype","fileupload");
    formData.append("userhash","");
    formData.append("fileToUpload",file);

    const res = await fetch("https://catbox.moe/user/api.php", { method: "POST", body: formData });
    const url = await res.text();
    if(!url.startsWith("http")) throw new Error("Invalid response from Catbox: " + url);
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!file || !name || !price){ setStatus("❌ Fill all fields"); return; }

    setStatus("⏳ Uploading...");
    try{
      const imageUrl = await uploadToCatbox(file);
      const productsRef = ref(db, "products");
      await push(productsRef, { name, description, price, image: imageUrl });
      setStatus("✅ Product uploaded!");
      setFile(null);
      setPreview(null);
      setName("");
      setDescription("");
      setPrice("");
    } catch(err){
      console.error(err);
      setStatus("❌ Upload failed: " + err.message);
    }
  };

  const styles = {
    container: { padding:"2rem", fontFamily:"Arial, sans-serif", background:"#f7f6fb" },
    form: { maxWidth:"500px", margin:"2rem auto", padding:"1.5rem", background:"#fff", borderRadius:"12px", boxShadow:"0 2px 8px rgba(0,0,0,0.1)" },
    input: { width:"100%", margin:"0.5rem 0", padding:"0.75rem", borderRadius:"6px", border:"1px solid #ccc", fontSize:"1rem" },
    button: { width:"100%", margin:"0.5rem 0", padding:"0.75rem", borderRadius:"6px", border:"none", fontSize:"1rem", background:"#4b145b", color:"#fff", cursor:"pointer" },
    buttonHover: { background:"#6a3e8e" },
    preview: { textAlign:"center", margin:"1rem 0" },
    products: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:"1.5rem", marginTop:"3rem" },
    product: { background:"#fff", padding:"1rem", borderRadius:"10px", boxShadow:"0 2px 6px rgba(0,0,0,0.1)", textAlign:"center" },
    productImg: { width:"100%", height:"180px", objectFit:"cover", borderRadius:"8px", display:"block", margin:"auto" },
    price: { color:"#6a3e8e", fontWeight:"bold", marginTop:"0.5rem" }
  };

  return (
    <div style={styles.container}>
      <h1 style={{textAlign:"center", color:"#4b145b"}}>Admin Panel & Shop</h1>
      <form style={styles.form} onSubmit={handleSubmit}>
        <input style={styles.input} type="text" placeholder="Product Name" value={name} onChange={e=>setName(e.target.value)} required/>
        <textarea style={styles.input} placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
        <input style={styles.input} type="number" placeholder="Price" value={price} onChange={e=>setPrice(e.target.value)} required/>
        <input style={styles.input} type="file" accept="image/*" onChange={handleFileChange} required/>
        {preview && <div style={styles.preview}><img src={preview} alt="preview" style={{maxWidth:"100%", maxHeight:"200px", borderRadius:"8px"}}/></div>}
        <button type="submit" style={styles.button}>Upload Product</button>
        <p>{status}</p>
      </form>

      <div style={styles.products}>
        {products.map((p,i)=>(
          <div key={i} style={styles.product}>
            <img src={p.image} alt={p.name} style={styles.productImg}/>
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <div style={styles.price}>₦{p.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
