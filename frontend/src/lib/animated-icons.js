'use client';

import React from 'react';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import * as Lucide from 'lucide-react';

// === Animate-ui icons (native animation support) ===
export { ArrowUp } from '@/components/animate-ui/icons/arrow-up';
export { ChevronDown } from '@/components/animate-ui/icons/chevron-down';
export { ChevronLeft } from '@/components/animate-ui/icons/chevron-left';
export { ChevronRight } from '@/components/animate-ui/icons/chevron-right';
export { Play } from '@/components/animate-ui/icons/play';
export { Search } from '@/components/animate-ui/icons/search';
export { Sparkles } from '@/components/animate-ui/icons/sparkles';
export { Star } from '@/components/animate-ui/icons/star';
export { Users } from '@/components/animate-ui/icons/users';
export { X } from '@/components/animate-ui/icons/x';
export { ArrowUp as ArrowUpIcon } from '@/components/animate-ui/icons/arrow-up';
export { ChevronDown as ChevronDownIcon } from '@/components/animate-ui/icons/chevron-down';
export { ChevronLeft as ChevronLeftIcon } from '@/components/animate-ui/icons/chevron-left';
export { ChevronRight as ChevronRightIcon } from '@/components/animate-ui/icons/chevron-right';

// === Lucide-react icons wrapped with AnimateIcon ===
function wrapIcon(LucideIcon) {
  function Wrapped(props) {
    return (
      <AnimateIcon animateOnHover>
        <LucideIcon {...props} />
      </AnimateIcon>
    );
  }
  Wrapped.displayName = `Animated${LucideIcon.displayName || LucideIcon.name || 'Icon'}`;
  return Wrapped;
}

const W = wrapIcon;

export const AlertCircle = W(Lucide.AlertCircle);
export const AlertTriangle = W(Lucide.AlertTriangle);
export const ArrowDown = W(Lucide.ArrowDown);
export const ArrowLeft = W(Lucide.ArrowLeft);
export const BadgeCheck = W(Lucide.BadgeCheck);
export const Banknote = W(Lucide.Banknote);
export const BarChart3 = W(Lucide.BarChart3);
export const Bell = W(Lucide.Bell);
export const BookOpen = W(Lucide.BookOpen);
export const Building = W(Lucide.Building);
export const CalendarDays = W(Lucide.CalendarDays);
export const Camera = W(Lucide.Camera);
export const Check = W(Lucide.Check);
export const CheckCircle = W(Lucide.CheckCircle);
export const ChevronUp = W(Lucide.ChevronUp);
export const CircleHelp = W(Lucide.CircleHelp);
export const ClipboardList = W(Lucide.ClipboardList);
export const Clock = W(Lucide.Clock);
export const CloudDownload = W(Lucide.CloudDownload);
export const Cog = W(Lucide.Cog);
export const CreditCard = W(Lucide.CreditCard);
export const Database = W(Lucide.Database);
export const DollarSign = W(Lucide.DollarSign);
export const Download = W(Lucide.Download);
export const Edit = W(Lucide.Edit);
export const EllipsisVertical = W(Lucide.EllipsisVertical);
export const ExternalLink = W(Lucide.ExternalLink);
export const Eye = W(Lucide.Eye);
export const EyeOff = W(Lucide.EyeOff);
export const FileDown = W(Lucide.FileDown);
export const FileText = W(Lucide.FileText);
export const Filter = W(Lucide.Filter);
export const Flame = W(Lucide.Flame);
export const GraduationCap = W(Lucide.GraduationCap);
export const Hammer = W(Lucide.Hammer);
export const IdCard = W(Lucide.IdCard);
export const Image = W(Lucide.Image);
export const Info = W(Lucide.Info);
export const Inbox = W(Lucide.Inbox);
export const Key = W(Lucide.Key);
export const Lock = W(Lucide.Lock);
export const LogOut = W(Lucide.LogOut);
export const Mail = W(Lucide.Mail);
export const MapPin = W(Lucide.MapPin);
export const MessageCircle = W(Lucide.MessageCircle);
export const Mic = W(Lucide.Mic);
export const Monitor = W(Lucide.Monitor);
export const Moon = W(Lucide.Moon);
export const Music = W(Lucide.Music);
export const Newspaper = W(Lucide.Newspaper);
export const Paintbrush = W(Lucide.Paintbrush);
export const Palette = W(Lucide.Palette);
export const Paperclip = W(Lucide.Paperclip);
export const Pause = W(Lucide.Pause);
export const Pencil = W(Lucide.Pencil);
export const Phone = W(Lucide.Phone);
export const PhoneOff = W(Lucide.PhoneOff);
export const PlayCircle = W(Lucide.PlayCircle);
export const Plus = W(Lucide.Plus);
export const PlusCircle = W(Lucide.PlusCircle);
export const Printer = W(Lucide.Printer);
export const RefreshCw = W(Lucide.RefreshCw);
export const Send = W(Lucide.Send);
export const Server = W(Lucide.Server);
export const Settings = W(Lucide.Settings);
export const Share2 = W(Lucide.Share2);
export const ShieldAlert = W(Lucide.ShieldAlert);
export const ShieldCheck = W(Lucide.ShieldCheck);
export const Smartphone = W(Lucide.Smartphone);
export const Smile = W(Lucide.Smile);
export const SquarePen = W(Lucide.SquarePen);
export const SwatchBook = W(Lucide.SwatchBook);
export const Tag = W(Lucide.Tag);
export const Trash2 = W(Lucide.Trash2);
export const Truck = W(Lucide.Truck);
export const Unlink = W(Lucide.Unlink);
export const Upload = W(Lucide.Upload);
export const User = W(Lucide.User);
export const UserCheck = W(Lucide.UserCheck);
export const UserCircle = W(Lucide.UserCircle);
export const UserMinus = W(Lucide.UserMinus);
export const UserPlus = W(Lucide.UserPlus);
export const Video = W(Lucide.Video);
export const Volume2 = W(Lucide.Volume2);
export const Wallet = W(Lucide.Wallet);
export const Wifi = W(Lucide.Wifi);
export const XCircle = W(Lucide.XCircle);
export const Zap = W(Lucide.Zap);
export const ArrowUpRight = W(Lucide.ArrowUpRight);
export const AtSign = W(Lucide.AtSign);
export const Building2 = W(Lucide.Building2);
export const ChevronsLeft = W(Lucide.ChevronsLeft);
export const ChevronsRight = W(Lucide.ChevronsRight);
export const File = W(Lucide.File);
export const Folder = W(Lucide.Folder);
export const FolderOpen = W(Lucide.FolderOpen);
export const Globe = W(Lucide.Globe);
export const Hand = W(Lucide.Hand);
export const Home = W(Lucide.Home);
export const LayoutGrid = W(Lucide.LayoutGrid);
export const Menu = W(Lucide.Menu);
export const TrendingDown = W(Lucide.TrendingDown);
export const TrendingUp = W(Lucide.TrendingUp);
export const UsersRound = W(Lucide.UsersRound);
