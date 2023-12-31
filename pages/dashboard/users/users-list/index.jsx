import React, { useState, useEffect, useRef } from 'react'
import {
    Box,
    Text,
    HStack,
    VStack,
    Stack,
    Button,
    Input,
    Image,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Switch,
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableContainer,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    VisuallyHidden,
    useToast,
} from '@chakra-ui/react'
import { SiMicrosoftexcel } from 'react-icons/si'
import { FaFileCsv, FaFilePdf, FaPrint } from 'react-icons/fa'
import {
    BsFileBarGraphFill,
    BsPenFill,
    BsChevronDoubleLeft,
    BsChevronDoubleRight,
    BsChevronLeft,
    BsChevronRight,
    BsShield
} from 'react-icons/bs'
import Layout from '../../layout';
import jsPDF from 'jspdf';
import "jspdf-autotable"
import BackendAxios, { ClientAxios } from '@/lib/utils/axios'
import CheckboxTree from 'react-checkbox-tree'
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import Script from 'next/script'
import Link from 'next/link'
import { BiPen, BiRupee } from 'react-icons/bi'
import fileDownload from 'js-file-download'
import { DownloadTableExcel } from "react-export-table-to-excel";
import { aepsList, axisList, basicList, bbpsList, cmsList, dmtList, fastagList, licList, matmList, panList, payoutList, rechargeList, userManagementList } from '@/lib/utils/permissions/structure'
import Cookies from 'js-cookie'

const ExportPDF = (currentRowData) => {
    const doc = new jsPDF('landscape')
    const columnDefs = [
        '#',
        'Basic Details',
        'KYC Details',
        'Balance Details',
        'Complete Address',
        'Parent Details',
        'Actions',
    ]

    doc.autoTable({ html: '#exportableTable' })
    doc.output('dataurlnewwindow');
}


const Index = () => {
    const Toast = useToast({
        position: 'top-right'
    })
    const [query, setQuery] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [userObjId, setUserObjId] = useState("")
    const [permissionsDrawer, setPermissionsDrawer] = useState(false)

    const [basicPermissions, setBasicPermissions] = useState([])
    const [basicExpansion, setBasicExpansion] = useState([])

    const [aepsPermissions, setAepsPermissions] = useState([])
    const [aepsExpansion, setAepsExpansion] = useState([])

    const [bbpsPermissions, setBbpsPermissions] = useState([])
    const [bbpsExpansion, setBbpsExpansion] = useState([])

    const [dmtPermissions, setDmtPermissions] = useState([])
    const [dmtExpansion, setDmtExpansion] = useState([])

    const [payoutPermissions, setPayoutPermissions] = useState([])
    const [payoutExpansion, setPayoutExpansion] = useState([])

    const [rechargePermissions, setRechargePermissions] = useState([])
    const [rechargeExpansion, setRechargeExpansion] = useState([])

    const [panPermissions, setPanPermissions] = useState([])
    const [panExpansion, setPanExpansion] = useState([])

    const [cmsPermissions, setCmsPermissions] = useState([])
    const [cmsExpansion, setCmsExpansion] = useState([])

    const [matmPermissions, setMatmPermissions] = useState([])
    const [matmExpansion, setMatmExpansion] = useState([])

    const [licPermissions, setLicPermissions] = useState([])
    const [licExpansion, setLicExpansion] = useState([])

    const [axisPermissions, setAxisPermissions] = useState([])
    const [axisExpansion, setAxisExpansion] = useState([])

    const [fastagPermissions, setFastagPermissions] = useState([])
    const [fastagExpansion, setFastagExpansion] = useState([])

    const [userManagementPermissions, setUserManagementPermissions] = useState([])
    const [userManagementExpansion, setUserManagementExpansion] = useState([])

    const availableTabs = ['retailers', 'distributor']
    const [selectedTab, setSelectedTab] = useState("retailer")
    const [fetchedUsers, setFetchedUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState("")
    const [pagination, setPagination] = useState({
        current_page: "1",
        total_pages: "1",
        first_page_url: "",
        last_page_url: "",
        next_page_url: "",
        prev_page_url: "",
    })

    // Fetching users
    function fetchUsersList(pageLink) {
        setFetchedUsers([])
        setIsLoading(true)
        BackendAxios.get(pageLink || `/api/admin/users-list/${selectedTab}?search=${query}&page=1`).then((res) => {
            setPagination({
                current_page: res.data.current_page,
                total_pages: parseInt(res.data.last_page),
                first_page_url: res.data.first_page_url,
                last_page_url: res.data.last_page_url,
                next_page_url: res.data.next_page_url,
                prev_page_url: res.data.prev_page_url,
            })
            setFetchedUsers(res.data.data)
            setIsLoading(false)
        }).catch((err) => {
            if (err?.response?.status == 401) {
              Cookies.remove("verified");
              window.location.reload();
            }
            console.log(err)
            setIsLoading(false)
            Toast({
                status: 'error',
                description: err.response.data.message || err.response.data || err.message
            })
        })
    }

    useEffect(() => {
        fetchUsersList()
    }, [selectedTab])


    function changeUserStatus(userId, updateTo) {
        BackendAxios.get(`/api/admin/user/status/${userId}/${updateTo}`).then(() => {
            fetchUsersList()
        }).catch((err) => {
            console.log(err)
            Toast({
                status: 'error',
                description: err.response.data.message || err.response.data || err.message
            })
        })
    }

    const [arePermissionsLoading, setArePermissionsLoading] = useState(false)
    // Fetch User Permissions
    function fetchUserPermissions() {
        setArePermissionsLoading(true)
        ClientAxios.post('/api/user/fetch', {
            user_id: `${selectedUser}`,
        },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        ).then((res) => {
            setUserObjId(res.data[0]._id)
            setBasicPermissions(res.data[0].allowed_pages.filter((page) => {
                return page.includes("basic")
            }))
            setAepsPermissions(res.data[0].allowed_pages.filter((page) => {
                return page.includes("aeps")
            }))
            setBbpsPermissions(res.data[0].allowed_pages.filter((page) => {
                return page.includes("bbps")
            }))
            setDmtPermissions(res.data[0].allowed_pages.filter((page) => {
                return page.includes("dmt")
            }))
            setRechargePermissions(res.data[0].allowed_pages.filter((page) => {
                return page.includes("recharge")
            }))
            setPayoutPermissions(res.data[0].allowed_pages.filter((page) => {
                return page.includes("payout")
            }))
            setPanPermissions(res.data[0].allowed_pages.filter((page) => {
                return page.includes("pan")
            }))
            setCmsPermissions(res.data[0].allowed_pages.filter((page) => {
                return page.includes("cms")
            }))
            setLicPermissions(res.data[0].allowed_pages.filter((page) => {
                return page.includes("lic")
            }))
            setMatmPermissions(res.data[0].allowed_pages.filter((page) => {
                return page.includes("matm")
            }))
            setAxisPermissions(res.data[0].allowed_pages.filter((page) => {
                return page.includes("axis")
            }))
            setUserManagementPermissions(res.data[0].allowed_pages.filter((page) => {
                return page.includes("userManagement")
            }))
            setArePermissionsLoading(false)
        }).catch((err) => {
            setArePermissionsLoading(false)
            console.log("No permissions found")
            console.log(err.message)
        })
    }


    useEffect(() => {
        fetchUserPermissions()
    }, [selectedUser])

    function openPermissionsDrawer(userId) {
        setSelectedUser(userId)
        setPermissionsDrawer(true)
    }

    function saveUserPermissions() {
        ClientAxios.post('/api/user/update-permissions', {
            allowed_pages: aepsPermissions.concat(
                basicPermissions,
                aepsPermissions,
                bbpsPermissions,
                dmtPermissions,
                payoutPermissions,
                cmsPermissions,
                rechargePermissions,
                matmPermissions,
                panPermissions,
                licPermissions,
                axisPermissions,
                fastagPermissions,
                userManagementPermissions
            ),
            user_id: selectedUser
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res) => {
            fetchUserPermissions()
            Toast({
                status: 'success',
                description: 'User permissions were updated!'
            })
        }).catch((err) => {
            Toast({
                status: 'error',
                title: 'Error Occured',
                description: err.response.data.message || err.response.data || err.message
            })
        })
    }

    function saveRemarks(userId, remarks) {
        BackendAxios.post(`/api/admin/user/remarks`, {
            userId: userId,
            remarks: remarks
        }).then(res => {
            Toast({
                status: 'success',
                description: 'Remarks Updated'
            })
        }).catch(err => {
            Toast({
                status: 'error',
                title: 'Error while adding remarks',
                description: err.response.data.message || err.response.data || err.message
            })
        })
    }

    function sendCredentials(userEmail, name) {
        BackendAxios.post(`/admin-send-creds`, {
            email: userEmail,
            name: name
        }).then(res => {
            Toast({
                status: 'success',
                description: 'Credentials Sent!'
            })
        }).catch(err => {
            Toast({
                status: 'error',
                title: 'Error while sending credentials',
                description: err.response.data.message || err.response.data || err.message
            })
        })
    }

    const tableRef = useRef(null)
    return (
        <>
            <Script
                src='https://kit.fontawesome.com/2aa643340e.js'
                crossOrigin='anonymous'
            />
            <Layout pageTitle={'Users List'}>
                <Tabs
                    variant='soft-rounded'
                    colorScheme='green'
                    isFitted
                >
                    <TabList>
                        <Tab
                            fontSize={['xs', 'lg']}
                            _selected={{ bg: 'twitter.500', color: 'white' }}
                            onClick={() => setSelectedTab("retailer")}
                            width={'xs'} flex={'unset'}
                        >
                            Retailer
                        </Tab>
                        <Tab
                            fontSize={['xs', 'lg']}
                            _selected={{ bg: 'twitter.500', color: 'white' }}
                            onClick={() => setSelectedTab("distributor")}
                            width={'xs'} flex={'unset'}
                        >
                            Distributor
                        </Tab>
                        <Tab
                            fontSize={['xs', 'lg']}
                            _selected={{ bg: 'twitter.500', color: 'white' }}
                            onClick={() => setSelectedTab("super_distributor")}
                            width={'xs'} flex={'unset'}
                        >
                            Super Distributor
                        </Tab>
                    </TabList>
                    <TabPanels pt={8}>
                        {
                            availableTabs.map((tab, key) => {
                                return (
                                    <TabPanel key={key}>

                                        <Stack
                                            direction={['column', 'row']}
                                            justifyContent={'space-between'}
                                            alignItems={'center'}
                                        >
                                            <HStack spacing={4}>
                                                <DownloadTableExcel
                                                    filename="UsersList"
                                                    sheet="users"
                                                    currentTableRef={tableRef.current}
                                                >
                                                    <Button
                                                        size={['xs', 'sm']}
                                                        colorScheme={'whatsapp'}
                                                        leftIcon={<SiMicrosoftexcel />}
                                                    >
                                                        Excel
                                                    </Button>
                                                </DownloadTableExcel>
                                                <Button
                                                    size={['xs', 'sm']}
                                                    colorScheme={'red'}
                                                    leftIcon={<FaFilePdf />}
                                                    onClick={() => ExportPDF()}
                                                >
                                                    PDF
                                                </Button>
                                                <Button
                                                    size={['xs', 'sm']}
                                                    colorScheme={'facebook'}
                                                    leftIcon={<FaPrint />}
                                                    onClick={() => ExportPDF()}
                                                >
                                                    Print
                                                </Button>
                                            </HStack>
                                            <HStack>
                                                <Input
                                                    bg={'white'}
                                                    w={['full', 'xs']}
                                                    placeholder={'Search User ID or Number'}
                                                    onChange={e => setQuery(e.target.value)}
                                                />
                                                <Button colorScheme='twitter' onClick={()=>fetchUsersList()}>Search</Button>
                                            </HStack>
                                        </Stack>

                                        <HStack spacing={2} mt={12} py={4} bg={'white'} justifyContent={'center'}>
                                            <Button
                                                colorScheme={'twitter'}
                                                fontSize={12} size={'xs'}
                                                variant={'outline'}
                                                onClick={() => fetchUsersList(pagination.first_page_url)}
                                            ><BsChevronDoubleLeft />
                                            </Button>
                                            <Button
                                                colorScheme={'twitter'}
                                                fontSize={12} size={'xs'}
                                                variant={'outline'}
                                                onClick={() => fetchUsersList(pagination.prev_page_url)}
                                            ><BsChevronLeft />
                                            </Button>
                                            <Button
                                                colorScheme={'twitter'}
                                                fontSize={12} size={'xs'}
                                                variant={'solid'}
                                            >{pagination.current_page}</Button>
                                            <Button
                                                colorScheme={'twitter'}
                                                fontSize={12} size={'xs'}
                                                variant={'outline'}
                                                onClick={() => fetchUsersList(pagination.next_page_url)}
                                            ><BsChevronRight />
                                            </Button>
                                            <Button
                                                colorScheme={'twitter'}
                                                fontSize={12} size={'xs'}
                                                variant={'outline'}
                                                onClick={() => fetchUsersList(pagination.last_page_url)}
                                            ><BsChevronDoubleRight />
                                            </Button>
                                        </HStack>
                                        {/* Table */}
                                        <TableContainer my={6} h={'xl'} overflowY={'scroll'}>
                                            {isLoading ? <Text>Loading data please wait...</Text> :
                                                <Table variant='striped' colorScheme='teal'>
                                                    <Thead>
                                                        <Tr>
                                                            <Th>Basic Details</Th>
                                                            <Th>KYC Details</Th>
                                                            <Th>Balance Details</Th>
                                                            <Th>Complete Address</Th>
                                                            <Th>KYC Documents</Th>
                                                            {/* <Th>Actions</Th> */}
                                                        </Tr>
                                                    </Thead>
                                                    <Tbody fontSize={'xs'}>
                                                        {
                                                            fetchedUsers && fetchedUsers.map((user, key) => {
                                                                return (
                                                                    <Tr key={key}>
                                                                        <Td>
                                                                            <Box mt={4}>
                                                                                <HStack spacing={4} pb={4}>
                                                                                    <a href={
                                                                                        user.profile_pic ?
                                                                                            `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${user.profile_pic}`
                                                                                            : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
                                                                                    } target={'_blank'}>
                                                                                        <Image
                                                                                            src={
                                                                                                user.profile_pic ?
                                                                                                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${user.profile_pic}`
                                                                                                    : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
                                                                                            }
                                                                                            boxSize={'10'} objectFit={'contain'}
                                                                                        />
                                                                                    </a>
                                                                                    <Box>
                                                                                        <Text><b>ID: </b>{user.id}</Text>
                                                                                        <Text>{user.first_name} {user.last_name} </Text>
                                                                                        <Text>
                                                                                            <a href={`tel:${user.phone_number}`}><b>MOB: </b>{user.phone_number}</a>
                                                                                        </Text>
                                                                                    </Box>
                                                                                </HStack>
                                                                                <Text>{user.email}</Text>
                                                                                <a href={`tel:${user.alternate_phone}`}><Text>{user.alternate_phone}</Text></a>
                                                                                <HStack spacing={0} my={2}>
                                                                                    <Link href={`/dashboard/users/manage-user?pageid=users&user_id=${user.id}`}>
                                                                                        <Button
                                                                                            size={'sm'} rounded={0}
                                                                                            colorScheme={'twitter'}
                                                                                            title={'Edit'}
                                                                                        >
                                                                                            <BsPenFill />
                                                                                        </Button>
                                                                                    </Link>
                                                                                    <Link href={`/dashboard/account/fund-transfer?pageid=transfer&user_id=${user.id}`}>
                                                                                        <Button
                                                                                            size={'sm'} rounded={0}
                                                                                            colorScheme={'whatsapp'}
                                                                                            title={'Transfer/Reversal'}
                                                                                        >
                                                                                            <BiRupee fontSize={18} />
                                                                                        </Button>
                                                                                    </Link>
                                                                                    <Link href={`/dashboard/reports/transactions/user-ledger?pageid=reports&user_id=${user.id}`}>
                                                                                        <Button
                                                                                            size={'sm'} rounded={0}
                                                                                            colorScheme={'red'}
                                                                                            title={'Reports'}
                                                                                        >
                                                                                            <BsFileBarGraphFill />
                                                                                        </Button>
                                                                                    </Link>
                                                                                    <Button
                                                                                        size={'sm'} rounded={0}
                                                                                        colorScheme={'teal'}
                                                                                        title={'Reports'}
                                                                                        onClick={() => openPermissionsDrawer(user.id)}
                                                                                    >
                                                                                        <BsShield />
                                                                                    </Button>
                                                                                    <HStack p={2} bg={'white'}>
                                                                                        <Switch
                                                                                            size={'sm'}
                                                                                            onChange={() => changeUserStatus(user.id, user.is_active == 1 ? 0 : 1)}
                                                                                            defaultChecked={user.is_active === 1}
                                                                                        ></Switch>
                                                                                    </HStack>
                                                                                </HStack>

                                                                                <HStack spacing={4}>
                                                                                    <Button
                                                                                        size={'xs'}
                                                                                        bgColor={'white'}
                                                                                        onClick={() => sendCredentials(user.email, user.first_name)}
                                                                                    >Send Credentials
                                                                                    </Button>

                                                                                    <Link href={`/dashboard/users/manage-user/edit-role-parent?pageid=users&user_id=${user.id}`}>
                                                                                        <Button
                                                                                            size={'xs'}
                                                                                            bgColor={'white'}
                                                                                        >Edit Role & Parent
                                                                                        </Button>
                                                                                    </Link>

                                                                                </HStack>
                                                                            </Box>
                                                                        </Td>
                                                                        <Td>
                                                                            <Box>
                                                                                <Text><b>Status: </b>&nbsp;&nbsp; Verified </Text>
                                                                                {/* <Text><b>Aadhaar No.: </b>&nbsp;&nbsp; {user.aadhaar} </Text>
                                                                            <Text><b>PAN: </b>&nbsp;&nbsp; {user.pan_number} </Text> */}
                                                                                <Text><b>GST No.: </b>&nbsp;&nbsp; {user.gst_number} </Text>
                                                                                <Text><b>Gender & DOB: </b>{user.gender} &nbsp;&nbsp;{user.dob}</Text>
                                                                                <Text><b>Organisation Code.: </b>&nbsp;&nbsp; RPAY </Text><br /><br />

                                                                            </Box>
                                                                        </Td>
                                                                        <Td pos={'relative'}>
                                                                            <Box>
                                                                                <Text><b>Current Balance: </b>&nbsp;&nbsp; ₹ {user.wallet} </Text>
                                                                                <Text><b>Capping Balance: </b>&nbsp;&nbsp; ₹ {user.minimum_balance} </Text>
                                                                                <Text textTransform={'capitalize'}>{user.packages.length != 0 ? user.packages[0].name : "No"} Plan</Text>
                                                                                <Text>{user.company_name} {user.firm_type}</Text>
                                                                            </Box>
                                                                        </Td>
                                                                        <Td>
                                                                            <Box>
                                                                                <Text>{user.line},</Text>
                                                                                <Text>{user.city}, {user.state},</Text>
                                                                                <Text>Pincode - {user.pincode}</Text>
                                                                            </Box>
                                                                            <Box pt={16}>
                                                                                <Text fontSize={'xs'}>Remarks</Text>
                                                                                <Input
                                                                                    onBlur={(e) => saveRemarks(user.id, e.target.value)}
                                                                                    placeholder={user.delete_remarks} bg={'aqua'}
                                                                                />
                                                                                <Text color={'red'} cursor={'pointer'} onClick={() => saveRemarks(user.id, " ")}>Remove remarks</Text>
                                                                            </Box>
                                                                        </Td>
                                                                        <Td>{/* PAN Card */}

                                                                            {
                                                                                user.pan_photo &&
                                                                                <Button size={'xs'}
                                                                                    onClick={() => BackendAxios.post(`/api/admin/file`, {
                                                                                        address: user.pan_photo
                                                                                    }, {
                                                                                        responseType: 'blob'
                                                                                    }).then(res => {
                                                                                        fileDownload(res.data, `PAN.jpeg`)
                                                                                    })}
                                                                                >View PAN Card</Button>
                                                                            }
                                                                            <br /><br />
                                                                            {/* Aadhaar Front */}
                                                                            {
                                                                                user.aadhar_front &&
                                                                                <Button size={'xs'}
                                                                                    onClick={() => BackendAxios.post(`/api/admin/file`, {
                                                                                        address: user.aadhaar_front
                                                                                    }, {
                                                                                        responseType: 'blob'
                                                                                    }).then(res => {
                                                                                        fileDownload(res.data, `AadhaarFront.jpeg`)
                                                                                    })
                                                                                    }
                                                                                >View Aadhaar Front</Button>
                                                                            }
                                                                            <br /><br />
                                                                            {/* Aadhaar Back */}
                                                                            {
                                                                                user.aadhar_back &&
                                                                                <Button size={'xs'}
                                                                                    onClick={() => BackendAxios.post(`/api/admin/file`, {
                                                                                        address: user.aadhaar_back
                                                                                    }, {
                                                                                        responseType: 'blob'
                                                                                    }).then(res => {
                                                                                        fileDownload(res.data, `AadhaarBack.jpeg`)
                                                                                    })
                                                                                    }
                                                                                >View Aadhaar Back</Button>
                                                                            }

                                                                        </Td>
                                                                    </Tr>
                                                                )
                                                            })
                                                        }
                                                    </Tbody>
                                                </Table>
                                            }
                                        </TableContainer>
                                        <HStack spacing={2} py={4} bg={'white'} justifyContent={'center'}>
                                            <Button
                                                colorScheme={'twitter'}
                                                fontSize={12} size={'xs'}
                                                variant={'outline'}
                                                onClick={() => fetchUsersList(pagination.first_page_url)}
                                            ><BsChevronDoubleLeft />
                                            </Button>
                                            <Button
                                                colorScheme={'twitter'}
                                                fontSize={12} size={'xs'}
                                                variant={'outline'}
                                                onClick={() => fetchUsersList(pagination.prev_page_url)}
                                            ><BsChevronLeft />
                                            </Button>
                                            <Button
                                                colorScheme={'twitter'}
                                                fontSize={12} size={'xs'}
                                                variant={'solid'}
                                            >{pagination.current_page}</Button>
                                            <Button
                                                colorScheme={'twitter'}
                                                fontSize={12} size={'xs'}
                                                variant={'outline'}
                                                onClick={() => fetchUsersList(pagination.next_page_url)}
                                            ><BsChevronRight />
                                            </Button>
                                            <Button
                                                colorScheme={'twitter'}
                                                fontSize={12} size={'xs'}
                                                variant={'outline'}
                                                onClick={() => fetchUsersList(pagination.last_page_url)}
                                            ><BsChevronDoubleRight />
                                            </Button>
                                        </HStack>

                                        {/* Printable Table */}
                                        <VisuallyHidden>
                                            <Table variant='striped' colorScheme='teal' id='exportableTable' ref={tableRef}>
                                                <Thead>
                                                    <Tr>
                                                        <Th>Basic Details</Th>
                                                        <Th>KYC Details</Th>
                                                        <Th>Balance Details</Th>
                                                        <Th>Complete Address</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody fontSize={'xs'}>
                                                    {
                                                        fetchedUsers && fetchedUsers.map((user, key) => {
                                                            return (
                                                                <Tr>
                                                                    <Td>
                                                                        <Box>
                                                                            {/* <Text textTransform={'capitalize'}>{user.packages[0].name} Plan</Text><br /><br /> */}
                                                                            <Text><b>ID: </b>{user.id}</Text>
                                                                            <Text>{user.first_name} {user.last_name} </Text><br />
                                                                            <Text>{user.email}</Text><br />
                                                                            <Text><br />
                                                                                <a href={`tel:${user.phone_number}`}>{user.phone_number}</a>,
                                                                                <a href={`tel:${user.alternate_phone}`}>{user.alternate_phone}</a>
                                                                            </Text>
                                                                            <Text>{user.gender} &nbsp;&nbsp;{user.dob}</Text><br /><br />
                                                                            <Text>{user.company_name} {user.firm_type}</Text><br />
                                                                        </Box>
                                                                    </Td>
                                                                    <Td>
                                                                        <Box>
                                                                            <Text><b>Status: </b>&nbsp;&nbsp; Verified </Text><br />
                                                                            <Text><b>Aadhaar No.: </b>&nbsp;&nbsp; {user.aadhaar} </Text><br />
                                                                            <Text><b>PAN: </b>&nbsp;&nbsp; {user.pan_number} </Text><br />
                                                                            <Text><b>GST No.: </b>&nbsp;&nbsp; {user.gst_number} </Text><br /><br />
                                                                            <Text><b>Organisation Code.: </b>&nbsp;&nbsp; RPAY </Text><br />
                                                                        </Box>
                                                                    </Td>
                                                                    <Td>
                                                                        <Box>
                                                                            <Text><b>Current Balance: </b>&nbsp;&nbsp; Rs. {user.wallet} </Text><br />
                                                                            <Text><b>Capping Balance: </b>&nbsp;&nbsp; Rs. {user.minimum_balance} </Text><br /><br />
                                                                        </Box>
                                                                    </Td>
                                                                    <Td>
                                                                        <Box>
                                                                            <Text>{user.line},</Text><br />
                                                                            <Text>{user.city}, {user.state},</Text><br />
                                                                            <Text>Pincode - {user.pincode}</Text><br />
                                                                        </Box>
                                                                    </Td>
                                                                </Tr>
                                                            )
                                                        })
                                                    }
                                                </Tbody>
                                            </Table>
                                        </VisuallyHidden>

                                    </TabPanel>
                                )
                            })
                        }

                    </TabPanels>
                </Tabs>


                {/* Permissions Drawer */}
                <Drawer
                    isOpen={permissionsDrawer}
                    placement='right'
                    onClose={() => setPermissionsDrawer(false)}
                    size={'lg'}
                >
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader>Manage Permissions For User</DrawerHeader>

                        <DrawerBody>
                            <form id='userPermission'>
                                <input type="hidden" name='userId' value={selectedUser} />
                                {arePermissionsLoading ? <Text>Please wait... Fetching Permissions</Text> :
                                    <VStack spacing={6} w={'full'} alignItems={'flex-start'}>
                                        <CheckboxTree
                                            nodes={basicList}
                                            checked={basicPermissions}
                                            onCheck={(checked) => setBasicPermissions(checked)}
                                            expanded={basicExpansion}
                                            onExpand={(expanded) => setBasicExpansion(expanded)}
                                        />

                                        <CheckboxTree
                                            nodes={aepsList}
                                            checked={aepsPermissions}
                                            onCheck={(checked) => setAepsPermissions(checked)}
                                            expanded={aepsExpansion}
                                            onExpand={(expanded) => setAepsExpansion(expanded)}
                                        />

                                        <CheckboxTree
                                            nodes={bbpsList}
                                            checked={bbpsPermissions}
                                            onCheck={(checked) => setBbpsPermissions(checked)}
                                            expanded={bbpsExpansion}
                                            onExpand={(expanded) => setBbpsExpansion(expanded)}
                                        />

                                        <CheckboxTree
                                            nodes={dmtList}
                                            checked={dmtPermissions}
                                            onCheck={(checked) => setDmtPermissions(checked)}
                                            expanded={dmtExpansion}
                                            onExpand={(expanded) => setDmtExpansion(expanded)}
                                        />

                                        <CheckboxTree
                                            nodes={payoutList}
                                            checked={payoutPermissions}
                                            onCheck={(checked) => setPayoutPermissions(checked)}
                                            expanded={payoutExpansion}
                                            onExpand={(expanded) => setPayoutExpansion(expanded)}
                                        />

                                        <CheckboxTree
                                            nodes={rechargeList}
                                            checked={rechargePermissions}
                                            onCheck={(checked) => setRechargePermissions(checked)}
                                            expanded={rechargeExpansion}
                                            onExpand={(expanded) => setRechargeExpansion(expanded)}
                                        />


                                        <CheckboxTree
                                            nodes={panList}
                                            checked={panPermissions}
                                            onCheck={(checked) => setPanPermissions(checked)}
                                            expanded={panExpansion}
                                            onExpand={(expanded) => setPanExpansion(expanded)}
                                        />


                                        <CheckboxTree
                                            nodes={matmList}
                                            checked={matmPermissions}
                                            onCheck={(checked) => setMatmPermissions(checked)}
                                            expanded={matmExpansion}
                                            onExpand={(expanded) => setMatmExpansion(expanded)}
                                        />


                                        <CheckboxTree
                                            nodes={cmsList}
                                            checked={cmsPermissions}
                                            onCheck={(checked) => setCmsPermissions(checked)}
                                            expanded={cmsExpansion}
                                            onExpand={(expanded) => setCmsExpansion(expanded)}
                                        />


                                        <CheckboxTree
                                            nodes={licList}
                                            checked={licPermissions}
                                            onCheck={(checked) => setLicPermissions(checked)}
                                            expanded={licExpansion}
                                            onExpand={(expanded) => setLicExpansion(expanded)}
                                        />


                                        <CheckboxTree
                                            nodes={axisList}
                                            checked={axisPermissions}
                                            onCheck={(checked) => setAxisPermissions(checked)}
                                            expanded={axisExpansion}
                                            onExpand={(expanded) => setAxisExpansion(expanded)}
                                        />


                                        <CheckboxTree
                                            nodes={fastagList}
                                            checked={fastagPermissions}
                                            onCheck={(checked) => setFastagPermissions(checked)}
                                            expanded={fastagExpansion}
                                            onExpand={(expanded) => setFastagExpansion(expanded)}
                                        />


                                        <CheckboxTree
                                            nodes={userManagementList}
                                            checked={userManagementPermissions}
                                            onCheck={(checked) => setUserManagementPermissions(checked)}
                                            expanded={userManagementExpansion}
                                            onExpand={(expanded) => setUserManagementExpansion(expanded)}
                                        />
                                    </VStack>
                                }
                            </form>
                        </DrawerBody>

                        <DrawerFooter>
                            <Button variant='outline' mr={3}
                                onClick={() => setPermissionsDrawer(false)}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme='blue'
                                onClick={saveUserPermissions}
                            >Save</Button>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>

            </Layout >
        </>
    )
}

export default Index