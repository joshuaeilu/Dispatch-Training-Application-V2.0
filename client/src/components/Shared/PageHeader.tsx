import React from "react";
import { Button, Divider, Typography } from "antd";
import {
  ArrowLeftOutlined,
  HistoryOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { checkIsMobile } from "../../contexts/AuthProvider";

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}
const navigation = [
  { name: 'Dashboard', href: '#', current: true },
  { name: 'Team', href: '#', current: false },
  { name: 'Projects', href: '#', current: false },
  { name: 'Calendar', href: '#', current: false },
  { name: 'Reports', href: '#', current: false },
]
const userNavigation = [
  { name: 'Your profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' },
]

function classNames(...classes : string[]) {
  return classes.filter(Boolean).join(' ')
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showButton?: boolean;
  buttonText?: string;
  onButtonPress?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  buttonText = "Add",
  showButton,
  onButtonPress,
  showBackButton = false,
  onBack,
}) => {
  const isMobile = checkIsMobile();

  return (
//     <div style={{ padding: isMobile ? "1rem": "1.5rem"}}>
//       <div
//         style={{
//           display: "flex",
//           justifyContent: isMobile ? "flex-start" : "space-between",
//           alignItems: isMobile ? "flex-start" : "center",
//           flexWrap: "wrap",
//           rowGap: 12,
//         }}
//       >
//         {/* Left side (Back + Title [+ Subtitle]) */}
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: 10,
//             flex: 1,
//             flexWrap: "wrap",
//           }}
//         >
//           {showBackButton && (
//             <Button
//               type="primary"
//               icon={<ArrowLeftOutlined />}
//               onClick={onBack}
//               style={{
//                 borderRadius: 6,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 width: isMobile ? 40 : undefined,
//                 height: isMobile ? 40 : undefined,
//               }}
//             />
//           )}

//           <div>
//             <Title
//               level={isMobile ? 3 : 2}
//               style={{
//                 marginBottom: subtitle && !isMobile ? 4 : 0,
//                 color: !isMobile ? "#8C2131" : "#000",
//               }}
//             >
//               {title}
//             </Title>

//             {!isMobile && subtitle && (
//               <Paragraph
//                 style={{
//                   fontSize: 16,
//                   color: "rgba(60, 60, 60, 0.75)",
//                   fontWeight: 500,
//                   margin: 0,
//                 }}
//               >
//                 {subtitle}
//               </Paragraph>
//             )}
//           </div>
//         </div>

//         {/* Desktop: Button on right */}
//         {showButton && !isMobile && (
//           <Button
//             type="primary"
//             size="large"
//             icon={buttonText === "History" ? <HistoryOutlined /> : <PlusOutlined />}
//             onClick={onButtonPress}
//           >
//             {buttonText}
//           </Button>
//         )}
//       </div>
// <Divider
//   style={{
//     marginBottom: 0,
//     marginTop: 12,
//     borderColor: '#8C2131', // Calvin maroon (or any theme highlight color)
//     borderWidth: 2,
//     borderStyle: 'solid',
//     opacity: 0.9,
//   }}
// >
//   {/* Optional centered label */}
// </Divider>

//       {/* Mobile: Button below title */}
//       {isMobile && showButton && (
//         <Button
//           type="primary"
//           block
//           size="large"
//           icon={buttonText === "History" ? <HistoryOutlined /> : <PlusOutlined />}
//           onClick={onButtonPress}
//           style={{ marginTop: 12 }}
//         >
//           {buttonText}
//         </Button>
//       )}
//     </div>

          
          <header className="py-10">
            <div className="mx-auto  px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight text-brand-maroon">{title}</h1>
              <p className="mt-2 text-base font-medium text-gray-600">{subtitle}</p>
            </div>
          </header>
       
  );
};
