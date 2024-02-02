import {useState} from "react"
import { Box, Menu, IconButton } from '@mui/material';
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';

export default function ReportDetails({description}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        color="solidBlue"
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <ExpandCircleDownIcon />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        
      >
        <Box sx={{padding: "4px 16px"}}>
        {description ? description : "No description provided"}
        </Box>
      </Menu>
    </div>
  );
}