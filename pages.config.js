/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminPanel from './pages/AdminPanel';
import CaptionGenerator from './pages/CaptionGenerator';
import CompetitorAnalyzer from './pages/CompetitorAnalyzer';
import ContentGenerator from './pages/ContentGenerator';
import ContentIdeas from './pages/ContentIdeas';
import Dashboard from './pages/Dashboard';
import EngagementTips from './pages/EngagementTips';
import HashtagGenerator from './pages/HashtagGenerator';
import HookGenerator from './pages/HookGenerator';
import KeywordResearch from './pages/KeywordResearch';
import PaymentSubmit from './pages/PaymentSubmit';
import PostAnalyzer from './pages/PostAnalyzer';
import Pricing from './pages/Pricing';
import ProfileAnalyzer from './pages/ProfileAnalyzer';
import SavedProjects from './pages/SavedProjects';
import TrendingTopics from './pages/TrendingTopics';
import YouTubeSEO from './pages/YouTubeSEO';
import __Layout from './Layout.jsx';

export const PAGES = {
    "AdminPanel": AdminPanel,
    "CaptionGenerator": CaptionGenerator,
    "CompetitorAnalyzer": CompetitorAnalyzer,
    "ContentGenerator": ContentGenerator,
    "ContentIdeas": ContentIdeas,
    "Dashboard": Dashboard,
    "EngagementTips": EngagementTips,
    "HashtagGenerator": HashtagGenerator,
    "HookGenerator": HookGenerator,
    "KeywordResearch": KeywordResearch,
    "PaymentSubmit": PaymentSubmit,
    "PostAnalyzer": PostAnalyzer,
    "Pricing": Pricing,
    "ProfileAnalyzer": ProfileAnalyzer,
    "SavedProjects": SavedProjects,
    "TrendingTopics": TrendingTopics,
    "YouTubeSEO": YouTubeSEO,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};