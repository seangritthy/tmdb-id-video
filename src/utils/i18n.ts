export type Locale = "en" | "km";
export const LOCALE_COOKIE_KEY = "vdomov_locale";

export const translations = {
  en: {
    // Navbar & Layout
    home: "Home",
    discover: "Discover",
    movies: "Movies",
    tvShows: "TV Shows",
    search: "Search",
    searchPlaceholder: "Search for movies or tv shows...",
    watchlist: "Watchlist",
    settings: "Settings",
    login: "Login",
    logout: "Logout",
    
    // Home Page
    continueWatching: "Continue Your Journey",
    todayTrendingMovies: "Today's Trending Movies",
    thisWeekTrendingMovies: "This Week's Trending Movies",
    popularMovies: "Popular Movies",
    nowPlayingMovies: "Now Playing Movies",
    upcomingMovies: "Upcoming Movies",
    topRatedMovies: "Top Rated Movies",
    todayTrendingTvShows: "Today's Trending TV Shows",
    thisWeekTrendingTvShows: "This Week's Trending TV Shows",
    popularTvShows: "Popular TV Shows",
    onTheAirTvShows: "On The Air TV Shows",
    topRatedTvShows: "Top Rated TV Shows",
    viewAll: "View All",

    // Search
    searchPlaceholderMovies: "Search your favorite movies...",
    searchPlaceholderTvShows: "Search your favorite TV shows...",
    noSearchSuggestions: "No search suggestions",
    searchButton: "Search",

    // Movie/TV Details
    play: "Play",
    trailer: "Trailer",
    overview: "Overview",
    cast: "Cast",
    similar: "Similar",
    photos: "Photos",
    youMayLike: "You may like",
    recommendations: "Recommendations",
    movie: "Movie",
    tv: "TV",
    playNow: "Play Now",
    viewEpisodes: "View Episodes",
    storyLine: "Story Line",
    topCasts: "Top Casts",
    back: "Back",
    sources: "Sources",
    episodes: "Episodes",
    season: "Season",
    episode: "Episode",
    nextEpisode: "Next Episode",
    previousEpisode: "Previous Episode",
    
    // Ads Warning
    beforeYouWatch: "Before you watch!",
    adsWarningText: "As our content is hosted by various third party providers, you may encounter pop up advertisements while streaming. To improve your viewing experience, we suggest using an ad-blocker like uBlock Origin or AdGuard. Please be aware that we don't have control over the ads displayed and cannot be held responsible for their content or any issues they may cause.",
    okayIUnderstand: "Okay, I understand",

    // Footer
    disclaimer: "Disclaimer",
    disclaimerText: "vdomov does not host any files on its server. All contents are provided by non-affiliated third parties.",
    
    // Source Selection
    selectSource: "Select Source",
    recommended: "Recommended",
    fastHosting: "Fast hosting",
    watchProgressSupport: "Watch Progress Support",
    mayContainPopupAds: "May contain popup ads",
    
    // Filters & Lists
    type: "Type",
    selectType: "Select type",
    resetFilters: "Reset Filters",
    genres: "Genres",
    selectGenres: "Select genres",
    endOfList: "You have reached the end of the list.",
    
    // TV Specific
    noEpisodesFound: "No episodes found.",
    comingSoon: "Coming Soon",
    seasonAndEpisode: "Season & Episode",
    searchEpisodes: "Search episodes...",

    // VDOtv Specific
    vdotv: "VDOtv",
    vdotvTitle: "VDOtv Live Streams",
    vdotvSubtitle: "Stream live television directly inside your dashboard.",
    vdotvNowPlaying: "Now Playing",
    vdotvSelectChannel: "Select a channel from the list below to play.",
    vdotvCorsProxy: "CORS Proxy Bypass",
    vdotvCorsProxyDescription: "Streams from external IPTV links frequently block web browsers. Keep this setting enabled to stream content through the VDOtv routing proxy.",
    vdotvDirectory: "TV Channel Directory",
    vdotvSearch: "Search channels...",
    vdotvAllGroups: "All Groups",
    vdotvLive: "Live",
    vdotvPlay: "Play",
    vdotvLoadingFeed: "Loading Feed Stream...",
    vdotvLoadingFeedDescription: "If the feed fails to play, check CORS settings below.",

    // Download App Specific
    downloadApps: "Download Apps",
    downloadMobile: "VDOmov Mobile App",
    downloadMobileDesc: "For Android Phones & Tablets",
    downloadTv: "VDOtv TV App",
    downloadTvDesc: "For Android TV & Smart TV Boxes",
  },
  km: {
    // Navbar & Layout
    home: "ទំព័រដើម",
    discover: "ស្វែងយល់",
    movies: "ភាពយន្ត",
    tvShows: "កម្មវិធីទូរទស្សន៍",
    search: "ស្វែងរក",
    searchPlaceholder: "ស្វែងរកភាពយន្ត ឬកម្មវិធីទូរទស្សន៍...",
    watchlist: "បញ្ជីមើល",
    settings: "ការកំណត់",
    login: "ចូលគណនី",
    logout: "ចាកចេញ",
    
    // Home Page
    continueWatching: "បន្តការទស្សនារបស់អ្នក",
    todayTrendingMovies: "ភាពយន្តពេញនិយមថ្ងៃនេះ",
    thisWeekTrendingMovies: "ភាពយន្តពេញនិយមសប្តាហ៍នេះ",
    popularMovies: "ភាពយន្តល្បីៗ",
    nowPlayingMovies: "ភាពយន្តកំពុងចាក់បញ្ចាំង",
    upcomingMovies: "ភាពយន្តជិតមកដល់",
    topRatedMovies: "ភាពយន្តទទួលបានការវាយតម្លៃខ្ពស់",
    todayTrendingTvShows: "កម្មវិធីទូរទស្សន៍ពេញនិយមថ្ងៃនេះ",
    thisWeekTrendingTvShows: "កម្មវិធីទូរទស្សន៍ពេញនិយមសប្តាហ៍នេះ",
    popularTvShows: "កម្មវិធីទូរទស្សន៍ល្បីៗ",
    onTheAirTvShows: "កម្មវិធីទូរទស្សន៍កំពុងចាក់ផ្សាយ",
    topRatedTvShows: "កម្មវិធីទូរទស្សន៍ទទួលបានការវាយតម្លៃខ្ពស់",
    viewAll: "មើលទាំងអស់",

    // Search
    searchPlaceholderMovies: "ស្វែងរកភាពយន្តដែលអ្នកចូលចិត្ត...",
    searchPlaceholderTvShows: "ស្វែងរកកម្មវិធីទូរទស្សន៍ដែលអ្នកចូលចិត្ត...",
    noSearchSuggestions: "គ្មានការផ្ដល់យោបល់ស្វែងរកទេ",
    searchButton: "ស្វែងរក",

    // Movie/TV Details
    play: "ចាក់",
    trailer: "ឈុតខ្លីៗ",
    overview: "សេចក្តីសង្ខេប",
    cast: "តួសម្តែង",
    similar: "ស្រដៀងគ្នា",
    photos: "រូបភាព",
    youMayLike: "អ្នកប្រហែលជាចូលចិត្ត",
    recommendations: "ការណែនាំ",
    movie: "ភាពយន្ត",
    tv: "ទូរទស្សន៍",
    playNow: "ចាក់ឥឡូវនេះ",
    viewEpisodes: "មើលភាគ",
    storyLine: "សាច់រឿង",
    topCasts: "តួសម្តែងកំពូល",
    back: "ត្រឡប់ក្រោយ",
    sources: "ប្រភព",
    episodes: "ភាគ",
    season: "រដូវកាល",
    episode: "ភាគ",
    nextEpisode: "ភាគបន្ទាប់",
    previousEpisode: "ភាគមុន",
    
    // Ads Warning
    beforeYouWatch: "មុនពេលអ្នកទស្សនា!",
    adsWarningText: "ដោយសារមាតិការបស់យើងត្រូវបានបង្ហោះដោយភាគីទីបី អ្នកអាចជួបប្រទះការផ្សាយពាណិជ្ជកម្មលោតឡើងនៅពេលកំពុងមើល។ ដើម្បីកែលម្អបទពិសោធន៍របស់អ្នក យើងស្នើឱ្យប្រើកម្មវិធីទប់ស្កាត់ការផ្សាយពាណិជ្ជកម្មដូចជា uBlock Origin ឬ AdGuard ។ សូមកត់សម្គាល់ថាយើងមិនមានការគ្រប់គ្រងលើការផ្សាយពាណិជ្ជកម្មដែលបានបង្ហាញទេ ហើយមិនទទួលខុសត្រូវចំពោះមាតិការបស់ពួកគេ ឬបញ្ហាណាមួយដែលពួកគេអាចបង្កឡើយ។",
    okayIUnderstand: "យល់ព្រម ខ្ញុំយល់ហើយ",

    // Footer
    disclaimer: "ការបដិសេធ",
    disclaimerText: "vdomov មិនផ្ទុកឯកសារណាមួយនៅលើម៉ាស៊ីនមេរបស់ខ្លួនទេ។ មាតិកាទាំងអស់ត្រូវបានផ្តល់ដោយភាគីទីបីដែលមិនពាក់ព័ន្ធ។",
    
    // Source Selection
    selectSource: "ជ្រើសរើសប្រភព",
    recommended: "បានណែនាំ",
    fastHosting: "បង្ហោះលឿន",
    watchProgressSupport: "គាំទ្រការចងចាំការទស្សនា",
    mayContainPopupAds: "អាចមានផ្ទាំងពាណិជ្ជកម្មលេចឡើង",

    // Filters & Lists
    type: "ប្រភេទ",
    selectType: "ជ្រើសរើសប្រភេទ",
    resetFilters: "កំណត់ចម្រោះឡើងវិញ",
    genres: "ប្រភេទរឿង",
    selectGenres: "ជ្រើសរើសប្រភេទរឿង",
    endOfList: "អ្នកបានមកដល់ចុងបញ្ជីហើយ។",

    // TV Specific
    noEpisodesFound: "រកមិនឃើញភាគទេ។",
    comingSoon: "ឆាប់ៗនេះ",
    seasonAndEpisode: "រដូវកាល និង ភាគ",
    searchEpisodes: "ស្វែងរកភាគ...",

    // VDOtv Specific
    vdotv: "VDOtv",
    vdotvTitle: "ខ្សែផ្សាយបន្តផ្ទាល់ VDOtv",
    vdotvSubtitle: "ផ្សាយបន្តផ្ទាល់ទូរទស្សន៍ភ្លាមៗនៅក្នុងផ្ទាំងគ្រប់គ្រងរបស់អ្នក។",
    vdotvNowPlaying: "កំពុងចាក់ផ្សាយ",
    vdotvSelectChannel: "សូមជ្រើសរើសប៉ុស្តិ៍ទូរទស្សន៍ពីបញ្ជីខាងក្រោមដើម្បីចាក់។",
    vdotvCorsProxy: "ប្រូកស៊ីលោតរំលង CORS",
    vdotvCorsProxyDescription: "ការផ្សាយពីតំណភ្ជាប់ IPTV ខាងក្រៅតែងតែរារាំងកម្មវិធីរុករក។ រក្សាការកំណត់នេះដើម្បីផ្សាយតាមរយៈប្រូកស៊ីលោតរំលង VDOtv ។",
    vdotvDirectory: "បញ្ជីប៉ុស្តិ៍ទូរទស្សន៍",
    vdotvSearch: "ស្វែងរកប៉ុស្តិ៍...",
    vdotvAllGroups: "គ្រប់ក្រុមទាំងអស់",
    vdotvLive: "បន្តផ្ទាល់",
    vdotvPlay: "ចាក់",
    vdotvLoadingFeed: "កំពុងទាញយកខ្សែផ្សាយ...",
    vdotvLoadingFeedDescription: "ប្រសិនបើការផ្សាយមិនអាចដំណើរការបាន សូមពិនិត្យការកំណត់ CORS ខាងក្រោម។",

    // Download App Specific
    downloadApps: "ទាញយកកម្មវិធី",
    downloadMobile: "កម្មវិធីទូរស័ព្ទ VDOmov",
    downloadMobileDesc: "សម្រាប់ទូរស័ព្ទ និងថេប្លេត Android",
    downloadTv: "កម្មវិធីទូរទស្សន៍ VDOtv",
    downloadTvDesc: "សម្រាប់ Android TV និង Smart TV Box",
  }
};

export type TranslationKey = keyof typeof translations.en;

export function getDictionary(locale: Locale) {
  return translations[locale] ?? translations.en;
}
