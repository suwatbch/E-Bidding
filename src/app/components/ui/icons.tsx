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
import { Home, Gavel, LocalOffer, Notifications, AccountCircle, KeyboardArrowDown, Edit, Logout, Menu, Close } from '@mui/icons-material';

interface IconProps {
  className?: string;
}

// Large Icons (32px)
export const LogoIcon = ({ className = "text-blue-600" }: IconProps) => (
  <GavelIcon style={{ width: '32px', height: '32px' }} className="text-white" />
);

export const NavLogoIcon = () => (
  <GavelIcon style={{ width: '32px', height: '32px' }} className="text-blue-600" />
);

// Medium Icons (20px)
export const FormEmailIcon = () => (
  <EmailIcon style={{ width: '20px', height: '20px' }} className="text-gray-400" />
);

export const FormLockIcon = () => (
  <LockIcon style={{ width: '20px', height: '20px' }} className="text-gray-400" />
);

export const FormKeyIcon = () => (
  <KeyIcon style={{ width: '20px', height: '20px' }} className="text-gray-400" />
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

// Category Icons (20px)
export const CategoryAllIcon = () => (
  <CategoryIcon style={{ width: '20px', height: '20px' }} />
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
  <PendingIcon style={{ width: '20px', height: '20px' }} className="text-yellow-500" />
);

export const StatusBiddingIcon = () => (
  <GavelIcon style={{ width: '20px', height: '20px' }} className="text-blue-500" />
);

export const StatusEndingSoonIcon = () => (
  <TimerIcon style={{ width: '20px', height: '20px' }} className="text-orange-500" />
);

export const StatusEndedIcon = () => (
  <CheckCircleIcon style={{ width: '20px', height: '20px' }} className="text-green-500" />
);

export const StatusCancelledIcon = () => (
  <BlockIcon style={{ width: '20px', height: '20px' }} className="text-red-500" />
);

// Utility Icons (20px)
export const SearchBarIcon = ({ className = "text-gray-400" }: IconProps) => (
  <Search style={{ width: '20px', height: '20px' }} className={className} />
);

export const TimeIcon = () => (
  <AccessTimeIcon style={{ width: '20px', height: '20px' }} className="text-gray-500" />
);

export const UserIcon = () => (
  <Person style={{ width: '20px', height: '20px' }} className="text-gray-500" />
);

// Navbar Icons (24px)
export const NavHomeIcon = () => (
  <Home style={{ width: '24px', height: '24px' }} />
);

export const NavAuctionIcon = () => (
  <Gavel style={{ width: '24px', height: '24px' }} />
);

export const NavMyAuctionIcon = () => (
  <LocalOffer style={{ width: '24px', height: '24px' }} />
);

export const NavNotificationIcon = () => (
  <Notifications style={{ width: '24px', height: '24px' }} />
);

export const NavProfileIcon = () => (
  <AccountCircle style={{ width: '24px', height: '24px' }} />
);

export const NavArrowDownIcon = ({ className }: IconProps) => (
  <KeyboardArrowDown style={{ width: '24px', height: '24px' }} className={className} />
);

export const NavEditIcon = () => (
  <Edit style={{ width: '24px', height: '24px' }} />
);

export const NavLogoutIcon = () => (
  <Logout style={{ width: '24px', height: '24px' }} />
);

export const NavMenuIcon = () => (
  <Menu style={{ width: '24px', height: '24px' }} />
);

export const NavCloseIcon = () => (
  <Close style={{ width: '24px', height: '24px' }} />
);

// Additional icons can be added here as needed 