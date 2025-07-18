import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import GavelIcon from '@mui/icons-material/Gavel';
import LoginIcon from '@mui/icons-material/Login';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyIcon from '@mui/icons-material/Key';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HelpIcon from '@mui/icons-material/Help';
import { Search } from '@mui/icons-material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Person } from '@mui/icons-material';
import CategoryIcon from '@mui/icons-material/Category';
import DevicesIcon from '@mui/icons-material/Devices';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import DiamondIcon from '@mui/icons-material/Diamond';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CollectionsIcon from '@mui/icons-material/Collections';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import TimerIcon from '@mui/icons-material/Timer';
import BlockIcon from '@mui/icons-material/Block';
import LanguageIcon from '@mui/icons-material/Language';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import InsightsIcon from '@mui/icons-material/Insights';
import SummarizeIcon from '@mui/icons-material/Summarize';
import DescriptionIcon from '@mui/icons-material/Description';
import ArticleIcon from '@mui/icons-material/Article';
import RefreshIcon from '@mui/icons-material/Refresh';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import {
  Home,
  Gavel,
  Balance,
  LocalOffer,
  Notifications,
  AccountCircle,
  KeyboardArrowDown,
  Edit,
  Logout,
  Menu,
  Close,
  Settings,
  Business,
  People,
  Category,
  AccessTime,
  Timer,
  CheckCircle,
  Block,
  PendingOutlined as Pending,
} from '@mui/icons-material';

interface IconProps {
  className?: string;
}

// Large Icons (32px)
export const LogoIcon = ({ className = 'text-blue-600' }: IconProps) => (
  <GavelIcon style={{ width: '32px', height: '32px' }} className="text-white" />
);

export const NavLogoIcon = ({ className }: IconProps) => (
  <GavelIcon style={{ width: '32px', height: '32px' }} className={className} />
);

export const AuctionIcon = ({ className }: IconProps) => (
  <GavelIcon style={{ width: '24px', height: '24px' }} className={className} />
);

// Report and Analytics Icons
export const NavReportIcon = ({ className }: IconProps) => (
  <AssessmentIcon
    style={{ width: '20px', height: '20px' }}
    className={className}
  />
);

export const NavBarChartIcon: React.FC<IconProps> = ({ className }) => (
  <BarChartIcon
    style={{ width: '20px', height: '20px' }}
    className={className}
  />
);

export const NavInsightsIcon = ({ className }: IconProps) => (
  <InsightsIcon
    style={{ width: '20px', height: '20px' }}
    className={className}
  />
);

export const NavSummarizeIcon = ({ className }: IconProps) => (
  <SummarizeIcon
    style={{ width: '20px', height: '20px' }}
    className={className}
  />
);

export const DocumentIcon = ({ className }: IconProps) => (
  <DescriptionIcon
    style={{ width: '20px', height: '20px' }}
    className={className}
  />
);

export const ArticleReportIcon = ({ className }: IconProps) => (
  <ArticleIcon
    style={{ width: '20px', height: '20px' }}
    className={className}
  />
);

// Medium Icons (20px)
export const FormEmailIcon = () => (
  <EmailIcon
    style={{ width: '20px', height: '20px' }}
    className="text-gray-400"
  />
);

export const FormLockIcon = () => (
  <LockIcon
    style={{ width: '20px', height: '20px' }}
    className="text-gray-400"
  />
);

export const FormKeyIcon = () => (
  <KeyIcon
    style={{ width: '20px', height: '20px' }}
    className="text-gray-400"
  />
);

export const ButtonLoginIcon = () => (
  <LoginIcon style={{ width: '20px', height: '20px' }} />
);

export const ButtonSendIcon = () => (
  <SendIcon style={{ width: '20px', height: '20px' }} />
);

// Small Icons (16px)
export const LinkBackIcon = () => (
  <ArrowBackIcon style={{ width: '16px', height: '16px' }} />
);

export const CategoryElectronicsIcon = () => (
  <DevicesIcon style={{ width: '20px', height: '20px' }} />
);

export const CategoryFashionIcon = () => (
  <LocalOfferIcon style={{ width: '20px', height: '20px' }} />
);

export const CategoryJewelryIcon = () => (
  <DiamondIcon style={{ width: '20px', height: '20px' }} />
);

export const CategoryVehicleIcon = () => (
  <DirectionsCarIcon style={{ width: '20px', height: '20px' }} />
);

export const CategoryCollectiblesIcon = () => (
  <CollectionsIcon style={{ width: '20px', height: '20px' }} />
);

// Status Icons (20px)
export const StatusPendingIcon = () => (
  <PendingIcon
    style={{ width: '20px', height: '20px' }}
    className="text-yellow-500"
  />
);

export const StatusBiddingIcon = () => (
  <GavelIcon
    style={{ width: '20px', height: '20px' }}
    className="text-blue-500"
  />
);

export const StatusEndingSoonIcon = () => (
  <TimerIcon
    style={{ width: '20px', height: '20px' }}
    className="text-orange-500"
  />
);

export const StatusEndedIcon = () => (
  <CheckCircleIcon
    style={{ width: '20px', height: '20px' }}
    className="text-green-500"
  />
);

export const StatusCancelledIcon = () => (
  <BlockIcon
    style={{ width: '20px', height: '20px' }}
    className="text-red-500"
  />
);

// Utility Icons (20px)
export const SearchBarIcon = ({ className = 'text-gray-400' }: IconProps) => (
  <Search style={{ width: '20px', height: '20px' }} className={className} />
);

export const TimeIcon = () => (
  <AccessTimeIcon
    style={{ width: '20px', height: '20px' }}
    className="text-gray-500"
  />
);

export const UserIcon = () => (
  <Person style={{ width: '20px', height: '20px' }} className="text-gray-500" />
);

export const NavRefreshIcon = ({ className }: IconProps) => (
  <RefreshIcon
    style={{ width: '16px', height: '16px' }}
    className={className}
  />
);

export const AucCategoryIcon: React.FC<IconProps> = ({ className }) => (
  <Category style={{ width: '16px', height: '16px' }} className={className} />
);

export const AucStartTimeIcon: React.FC<IconProps> = ({ className }) => (
  <AccessTime style={{ width: '16px', height: '16px' }} className={className} />
);

export const AucEndTimeIcon: React.FC<IconProps> = ({ className }) => (
  <Timer style={{ width: '16px', height: '16px' }} className={className} />
);

export const AucUserIcon: React.FC<IconProps> = ({ className }) => (
  <Person style={{ width: '18px', height: '18px' }} className={className} />
);

export const AucMoneyIcon: React.FC<IconProps> = ({ className }) => (
  <AttachMoneyIcon
    style={{ width: '16px', height: '16px' }}
    className={className}
  />
);

export const AucTrophyIcon: React.FC<IconProps> = ({ className }) => (
  <EmojiEventsIcon
    style={{ width: '16px', height: '16px' }}
    className={className}
  />
);

export const AucApartmentIcon: React.FC<IconProps> = ({ className }) => (
  <ApartmentIcon
    style={{ width: '16px', height: '16px' }}
    className={className}
  />
);

export const AucAssignmentIcon: React.FC<IconProps> = ({ className }) => (
  <AssignmentIndIcon
    style={{ width: '16px', height: '16px' }}
    className={className}
  />
);

export const AucHourglassIcon: React.FC<IconProps> = ({ className }) => (
  <HourglassEmptyIcon
    style={{ width: '15px', height: '15px' }}
    className={className}
  />
);

export const AucCurrencyIcon: React.FC<IconProps> = ({ className }) => (
  <CurrencyExchangeIcon
    style={{ width: '16px', height: '16px' }}
    className={className}
  />
);

// Auction Status Icons
export const AucOpenIcon: React.FC<IconProps> = ({ className }) => (
  <CheckCircle
    style={{ width: '16px', height: '16px' }}
    className={className}
  />
);

export const AucPendingIcon: React.FC<IconProps> = ({ className }) => (
  <Pending style={{ width: '16px', height: '16px' }} className={className} />
);

export const AucBiddingIcon: React.FC<IconProps> = ({ className }) => (
  <Gavel style={{ width: '16px', height: '16px' }} className={className} />
);

export const AucBalanceIcon: React.FC<IconProps> = ({ className }) => (
  <Balance style={{ width: '35px', height: '35px' }} className={className} />
);

export const AucEndingSoonIcon: React.FC<IconProps> = ({ className }) => (
  <Timer style={{ width: '16px', height: '16px' }} className={className} />
);

export const AucEndedIcon: React.FC<IconProps> = ({ className }) => (
  <CheckCircle
    style={{ width: '16px', height: '16px' }}
    className={className}
  />
);

export const AucCancelledIcon: React.FC<IconProps> = ({ className }) => (
  <Block style={{ width: '16px', height: '16px' }} className={className} />
);

export const AucOfferIcon: React.FC<IconProps> = ({ className }) => (
  <LocalOffer style={{ width: '16px', height: '16px' }} className={className} />
);

// Navbar Icons (24px)
export const NavHomeIcon: React.FC<IconProps> = ({ className }) => (
  <Home style={{ width: '20px', height: '20px' }} className={className} />
);

export const NavAuctionIcon: React.FC<IconProps> = ({ className }) => (
  <Gavel style={{ width: '20px', height: '20px' }} className={className} />
);

export const NavMyAuctionIcon: React.FC<IconProps> = ({ className }) => (
  <LocalOffer style={{ width: '20px', height: '20px' }} className={className} />
);

export const NavNotificationIcon: React.FC<IconProps> = ({ className }) => (
  <Notifications
    style={{ width: '18px', height: '18px' }}
    className={className}
  />
);

export const NavProfileIcon = () => (
  <AccountCircle style={{ width: '38px', height: '38px' }} />
);

export const NavArrowDownIcon = ({ className }: IconProps) => (
  <KeyboardArrowDown
    style={{ width: '24px', height: '24px' }}
    className={className}
  />
);

export const NavEditIcon = ({ className = '' }: IconProps) => (
  <Edit style={{ width: '18px', height: '18px' }} className={className} />
);

export const NavLogoutIcon = ({ className = '' }: IconProps) => (
  <Logout style={{ width: '18px', height: '18px' }} className={className} />
);

export const NavMenuIcon = () => (
  <Menu style={{ width: '24px', height: '24px' }} />
);

export const NavCloseIcon = () => (
  <Close style={{ width: '24px', height: '24px' }} />
);

export const NavDataIcon = () => (
  <Settings style={{ width: '20px', height: '20px' }} />
);

// Company and User Icons for Navbar
export const NavCompanyIcon = ({ className = '' }: IconProps) => (
  <Business style={{ width: '20px', height: '20px' }} className={className} />
);

export const NavUserIcon = ({ className = '' }: IconProps) => (
  <People style={{ width: '20px', height: '20px' }} className={className} />
);

// Language Icon
export const NavLanguageIcon = ({ className = '' }: IconProps) => (
  <LanguageIcon
    style={{ width: '18px', height: '18px' }}
    className={className}
  />
);

export const NavLanguageManageIcon = ({ className = '' }: IconProps) => (
  <LanguageIcon
    style={{ width: '20px', height: '20px' }}
    className={className}
  />
);

export const NavAuctionTypeIcon = ({ className = '' }: IconProps) => (
  <CategoryIcon
    style={{ width: '20px', height: '20px' }}
    className={className}
  />
);

// Additional icons can be added here as needed

export function NavSaveIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M5.478 5.559A1.5 1.5 0 016.912 4.5H9A.75.75 0 009 3H6.912a3 3 0 00-2.868 2.118l-2.411 7.838a3 3 0 00-.133.882V18a3 3 0 003 3h15a3 3 0 003-3v-4.162c0-.299-.045-.596-.133-.882l-2.412-7.838A3 3 0 0017.088 3H15a.75.75 0 000 1.5h2.088a1.5 1.5 0 011.434 1.059l2.411 7.838a1.5 1.5 0 01.067.441V18a1.5 1.5 0 01-1.5 1.5H3.75A1.5 1.5 0 012.25 18v-4.162c0-.147.023-.293.067-.441l2.411-7.838z"
        clipRule="evenodd"
      />
      <path d="M12 2.25a.75.75 0 01.75.75v8.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75z" />
    </svg>
  );
}

export const LockTableIcon = () => (
  <LockIcon
    style={{ width: '18px', height: '18px' }}
    className="text-red-400 hover:scale-110 transition-transform duration-200"
  />
);
