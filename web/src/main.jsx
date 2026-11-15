import React,{createContext,useContext,useEffect,useState} from 'react';
import{createRoot}from'react-dom/client';
import{BrowserRouter,Routes,Route,useLocation}from'react-router-dom';
import{api}from'./api';
import{PublicShell,PageView,StoriesView,StoryView,NotFound}from'./components/Public';
import AdminApp from './admin/AdminApp';
import './styles.css';
import './admin/admin.css';

const SiteContext=createContext({settings:{},navigation:[]});
export const useSite=()=>useContext(SiteContext);
function SiteProvider({children}){
 const [data,setData]=useState({settings:{},navigation:[]});
 useEffect(()=>{api('/site').then(setData).catch(console.error)},[]);
 return <SiteContext.Provider value={data}>{children}</SiteContext.Provider>;
}
function PublicRoutes(){return <PublicShell><Routes>
 <Route path="/" element={<PageView slug="home"/>}/>
 <Route path="/stories" element={<StoriesView/>}/>
 <Route path="/stories/:slug" element={<StoryView/>}/>
 <Route path="/:slug" element={<PageView/>}/>
 <Route path="*" element={<NotFound/>}/>
 </Routes></PublicShell>}
function Root(){
 const {pathname}=useLocation();
 // Render the public/admin route trees directly instead of inside a splat route.
 // This keeps nested <Routes> compatible with v7_relativeSplatPath.
 const isAdmin=pathname==='/admin'||pathname.startsWith('/admin/');
 return <SiteProvider>{isAdmin?<AdminApp/>:<PublicRoutes/>}</SiteProvider>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter future={{v7_startTransition:true,v7_relativeSplatPath:true}}><Root/></BrowserRouter></React.StrictMode>);
