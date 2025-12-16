export interface OrgEmployee {
    id: string;
    name: string;
    role: string;
    location: string;
    avatarUrl: string;
    email: string;
    phone: string;
    children?: OrgEmployee[];
}

const getAvatar = (name: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=64`;

export const orgChartData: OrgEmployee = {
    id: '1',
    name: 'Mark Bohlers',
    role: 'Founder and CEO',
    location: 'Steller Foods Headquarters',
    avatarUrl: getAvatar('Mark Bohlers'),
    email: 'mark.bohlers@stellerfoods.com',
    phone: '+1 (555) 123-4567',
    children: [
        {
            id: '2',
            name: 'Michelle Fillet',
            role: 'VP of Sales',
            location: 'Steller Foods Headquarters',
            avatarUrl: getAvatar('Michelle Fillet'),
            email: 'michelle.fillet@stellerfoods.com',
            phone: '+1 (555) 234-5678',
            children: [
                {
                    id: '3',
                    name: 'Brandon Septimus',
                    role: 'Sales Manager',
                    location: 'Steller Foods Headquarters',
                    avatarUrl: getAvatar('Brandon Septimus'),
                    email: 'brandon.s@stellerfoods.com',
                    phone: '+1 (555) 345-6789',
                },
                {
                    id: '4',
                    name: 'Cristofer Curtis',
                    role: 'Associate Director of Sales',
                    location: 'Steller Foods Headquarters',
                    avatarUrl: getAvatar('Cristofer Curtis'),
                    email: 'cris.curtis@stellerfoods.com',
                    phone: '+1 (555) 456-7890',
                },
                {
                    id: '5',
                    name: 'Jocelyn Lubin',
                    role: 'Associate Director of Sales',
                    location: 'Steller Foods Headquarters',
                    avatarUrl: getAvatar('Jocelyn Lubin'),
                    email: 'j.lubin@stellerfoods.com',
                    phone: '+1 (555) 567-8901',
                },
                {
                    id: '6',
                    name: 'Talan Passaquindici',
                    role: 'Senior Director of Sales',
                    location: 'Steller Foods Headquarters',
                    avatarUrl: getAvatar('Talan Passaquindici'),
                    email: 'talan.p@stellerfoods.com',
                    phone: '+1 (555) 678-9012',
                    children: [
                        {
                            id: '9',
                            name: 'Kaylynn Geidt',
                            role: 'NW Regional Sales Architect',
                            location: 'Steller Foods Headquarters',
                            avatarUrl: getAvatar('Kaylynn Geidt'),
                            email: 'k.geidt@stellerfoods.com',
                            phone: '+1 (555) 789-0123',
                        },
                    ]
                },
                {
                    id: '7',
                    name: 'Ashlynn Calzoni',
                    role: 'Sales and Marketing Manager',
                    location: 'Steller Foods Headquarters',
                    avatarUrl: getAvatar('Ashlynn Calzoni'),
                    email: 'ashlynn.c@stellerfoods.com',
                    phone: '+1 (555) 890-1234',
                },
                {
                    id: '8',
                    name: 'Angel Vetrovs',
                    role: 'Sales and Marketing Manager',
                    location: 'Steller Foods Headquarters',
                    avatarUrl: getAvatar('Angel Vetrovs'),
                    email: 'angel.v@stellerfoods.com',
                    phone: '+1 (555) 901-2345',
                },
            ]
        }
    ]
};
