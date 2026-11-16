import React,{createContext,useContext,useEffect,useState} from 'react';
import{createRoot}from'react-dom/client';
import{BrowserRouter,Routes,Route,useLocation}from'react-router-dom';
import{api}from'./api';
import GleamsPublic from './components/GleamsPublic';
import AdminApp from './admin/AdminApp';
import './styles.css';
import './admin/admin.css';
import './components/gleams.css';
import './components/gleams-fidelity.css';

const SiteContext=createContext({settings:{},navigation:[]});
export const useSite=()=>useContext(SiteContext);
function SiteProvider({children}){
 const [data,setData]=useState({settings:{},navigation:[],loaded:false});
 useEffect(()=>{api('/site').then(d=>setData({...d,loaded:true})).catch(console.error)},[]);
 return <SiteContext.Provider value={data}>{children}</SiteContext.Provider>;
}
function PublicRoutes(){const {pathname}=useLocation();const m=pathname.match(/^\/stories\/([^/]+)$/);return m?<GleamsPublic post/>:<GleamsPublic pageSlug={pathname==='/'?'home':pathname==='/stories'?'magazine':pathname.slice(1).split('/')[0]}/>}
function Root(){
 const {pathname}=useLocation();
 // Render the public/admin route trees directly instead of inside a splat route.
 // This keeps nested <Routes> compatible with v7_relativeSplatPath.
 const isAdmin=pathname==='/admin'||pathname.startsWith('/admin/');
 return <SiteProvider>{isAdmin?<AdminApp/>:<PublicRoutes/>}</SiteProvider>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter future={{v7_startTransition:true,v7_relativeSplatPath:true}}><Root/></BrowserRouter></React.StrictMode>);
