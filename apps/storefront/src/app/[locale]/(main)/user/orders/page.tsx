import {ApprovedOrderEmpty} from '@/components/yasminat/approved/Orders';
import { isEmpty } from 'lodash';

import { LoginForm, ParcelAccordion, UserNavigation } from '@/components/molecules';
import { OrdersPagination } from '@/components/sections';
import { retrieveCustomer } from '@/lib/data/customer';
import { listOrders } from '@/lib/data/orders';

const LIMIT = 10;

export default async function UserPage({
  searchParams
}: {
  searchParams: Promise<{ page: string }>;
}) {
  const user = await retrieveCustomer();

  if (!user) return <main className="screen-content container order-page"><ApprovedOrderEmpty requiresLogin/></main>;

  const orders = await listOrders();

  const { page } = await searchParams;

  const pages = Math.ceil(orders.length / LIMIT);
  const currentPage = +page || 1;
  const offset = (+currentPage - 1) * LIMIT;

  const orderGroupsGrouped = orders.reduce(
    (acc, order) => {
      const orderGroupId = (order as any).order_group.id;
      if (!acc[orderGroupId]) {
        acc[orderGroupId] = [];
      }
      acc[orderGroupId].push(order);
      return acc;
    },
    {} as Record<string, typeof orders>
  );

  const orderGroups = Object.entries(orderGroupsGrouped).map(([orderGroupId, orders]) => {
    const firstOrder = orders[0];
    const orderGroup = (firstOrder as any).order_group;

    return {
      id: orderGroupId,
      orders: orders,
      created_at: orderGroup.created_at,
      display_id: orderGroup.display_id,
      total: orders.reduce((sum, order) => sum + order.total, 0),
      currency_code: firstOrder.currency_code
    };
  });

  const processedOrders = orderGroups.slice(offset, offset + LIMIT);

  return (
    <main
      className="screen-content container order-page"
      data-testid="orders-page"
    >
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-4 md:gap-8">
        <div className="order-user-navigation"><UserNavigation /></div>
        <div
          className="space-y-8 md:col-span-3"
          data-testid="orders-container"
        >
          <h1 className="heading-md uppercase order-page-title">Orders</h1>
          {isEmpty(orders) ? (
            <ApprovedOrderEmpty/>
          ) : (
            <>
              <div
                className="w-full max-w-full"
                data-testid="orders-list"
              >
                {processedOrders.map(orderGroup => (
                  <ParcelAccordion
                    key={orderGroup.id}
                    orderId={orderGroup.id}
                    orderDisplayId={`#${orderGroup.display_id}`}
                    createdAt={orderGroup.created_at}
                    total={orderGroup.total}
                    orders={orderGroup.orders || []}
                    currency_code={orderGroup.currency_code}
                  />
                ))}
              </div>
              <OrdersPagination pages={pages} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
