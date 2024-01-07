"use client"
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
type dataType = {
    open : boolean;
    setIsOpen : React.Dispatch<React.SetStateAction<boolean>>;
}
const CloseOpenButton = (props : dataType)=>{
    if (props.open)
        props.setIsOpen(true)
    else
        props.setIsOpen(false)
    return (
        <>
            {props.open ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
            ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
            )}
        </>
    );
}

export default CloseOpenButton;