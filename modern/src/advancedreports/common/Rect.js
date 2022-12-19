import React from "react";

const Rect = ({w, h,c}) => {
    return (<svg width={w} height={h} xmlns="http://www.w3.org/2000/svg">
                <rect width={w} height={h} fill={c} />
                
            </svg>)
}
export default Rect